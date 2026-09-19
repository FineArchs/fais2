import { AiScriptError, AiScriptRuntimeError, NonAiScriptError } from '../../error.js';
import * as Ast from '../../node.js';
import { assertValue, isControl, unWrapRet, type Control } from '../control.js';
import { Reference } from '../reference.js';
import { assertArray, assertFunction, assertNumber, assertObject, assertString, expectAny, isArray, isObject, reprValue } from '../util.js';
import { NULL, type Value, type VFn } from '../value.js';
import { dispatch, dispatchSync } from './dispatch.js';
import type { Scope } from '../scope.js';
import type { CallInfo, EvalRuntime, RuntimeLogObject } from './runtime.js';

export function evalNode(runtime: EvalRuntime, node: Ast.Node, scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control> {
	return evalNodeInner(runtime, node, scope, callStack).catch((e: unknown) => {
		if (typeof e === 'object' && e !== null && 'pos' in e && e.pos) throw e;
		else {
			const e2 = (e instanceof AiScriptError) ? e : new NonAiScriptError(e);
			e2.pos = node.loc.start;
			e2.message = [
				e2.message,
				...[...callStack, { pos: e2.pos }].map(({ pos }, i) => {
					const name = callStack[i - 1]?.name ?? '<root>';
					return pos
						? `  at ${name} (Line ${pos.line}, Column ${pos.column})`
						: `  at ${name}`;
				}).reverse(),
			].join('\n');
			throw e2;
		}
	});
}

export function evalNodeSync(runtime: EvalRuntime, node: Ast.Node, scope: Scope, callStack: readonly CallInfo[]): Value | Control {
	return evalNodeInnerSync(runtime, node, scope, callStack);
}

export function evalClause(runtime: EvalRuntime, node: Ast.Statement | Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control> {
	return evalNode(runtime, node, Ast.isStatement(node) ? scope.createChildScope() : scope, callStack);
}

export function evalClauseSync(runtime: EvalRuntime, node: Ast.Statement | Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Value | Control {
	return evalNodeSync(runtime, node, Ast.isStatement(node) ? scope.createChildScope() : scope, callStack);
}

export async function evalBinaryOperation(runtime: EvalRuntime, op: string, leftExpr: Ast.Expression, rightExpr: Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control> {
	const callee = scope.get(op);
	assertFunction(callee);
	const left = await evalNode(runtime, leftExpr, scope, callStack);
	if (isControl(left)) {
		return left;
	}
	const right = await evalNode(runtime, rightExpr, scope, callStack);
	if (isControl(right)) {
		return right;
	}
	return call(runtime, callee, [left, right], callStack);
}

export function evalBinaryOperationSync(runtime: EvalRuntime, op: string, leftExpr: Ast.Expression, rightExpr: Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Value | Control {
	const callee = scope.get(op);
	assertFunction(callee);
	const left = evalNodeSync(runtime, leftExpr, scope, callStack);
	if (isControl(left)) {
		return left;
	}
	const right = evalNodeSync(runtime, rightExpr, scope, callStack);
	if (isControl(right)) {
		return right;
	}
	return callSync(runtime, callee, [left, right], callStack);
}

export async function run(runtime: EvalRuntime, program: Ast.Node[], scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control> {
	log(runtime, 'block:enter', { scope: scope.name });

	let v: Value | Control = NULL;

	for (let i = 0; i < program.length; i++) {
		const node = program[i]!;

		v = await evalNode(runtime, node, scope, callStack);
		if (v.type === 'return') {
			log(runtime, 'block:return', { scope: scope.name, val: v.value });
			return v;
		} else if (v.type === 'break') {
			log(runtime, 'block:break', { scope: scope.name });
			return v;
		} else if (v.type === 'continue') {
			log(runtime, 'block:continue', { scope: scope.name });
			return v;
		}
	}

	log(runtime, 'block:leave', { scope: scope.name, val: v });
	return v;
}

export function runSync(runtime: EvalRuntime, program: Ast.Node[], scope: Scope, callStack: readonly CallInfo[]): Value | Control {
	log(runtime, 'block:enter', { scope: scope.name });

	let v: Value | Control = NULL;

	for (let i = 0; i < program.length; i++) {
		const node = program[i]!;

		v = evalNodeSync(runtime, node, scope, callStack);
		if (v.type === 'return') {
			log(runtime, 'block:return', { scope: scope.name, val: v.value });
			return v;
		} else if (v.type === 'break') {
			log(runtime, 'block:break', { scope: scope.name });
			return v;
		} else if (v.type === 'continue') {
			log(runtime, 'block:continue', { scope: scope.name });
			return v;
		}
	}

	log(runtime, 'block:leave', { scope: scope.name, val: v });
	return v;
}

export async function call(runtime: EvalRuntime, fn: VFn, args: Value[], callStack: readonly CallInfo[], pos?: Ast.Pos): Promise<Value> {
	if (fn.native) {
		const info: CallInfo = { name: '<native>', pos };
		const result = fn.native(args, {
			call: (fn, args) => call(runtime, fn, args, [...callStack, info]),
			topCall: runtime.execFn,
			registerAbortHandler: runtime.registerAbortHandler,
			registerPauseHandler: runtime.registerPauseHandler,
			registerUnpauseHandler: runtime.registerUnpauseHandler,
			unregisterAbortHandler: runtime.unregisterAbortHandler,
			unregisterPauseHandler: runtime.unregisterPauseHandler,
			unregisterUnpauseHandler: runtime.unregisterUnpauseHandler,
		});
		return await result ?? NULL;
	} else {
		const fnScope = fn.scope.createChildScope();
		for (const [i, param] of fn.params.entries()) {
			const arg = args[i];
			if (!param.default) expectAny(arg);
			define(runtime, fnScope, param.dest, arg ?? param.default!, true);
		}

		const info: CallInfo = { name: fn.name ?? '<anonymous>', pos };
		return unWrapRet(await run(runtime, fn.statements, fnScope, [...callStack, info]));
	}
}

export function callSync(runtime: EvalRuntime, fn: VFn, args: Value[], callStack: readonly CallInfo[], pos?: Ast.Pos): Value {
	if (fn.native) {
		const info: CallInfo = { name: '<native>', pos };
		if (!fn.nativeSync) {
			throw new AiScriptRuntimeError('The function does not support sync mode.');
		}
		const result = fn.nativeSync(args, {
			call: (fn, args) => callSync(runtime, fn, args, [...callStack, info]),
			topCall: runtime.execFnSync,
			registerAbortHandler: runtime.registerAbortHandler,
			registerPauseHandler: runtime.registerPauseHandler,
			registerUnpauseHandler: runtime.registerUnpauseHandler,
			unregisterAbortHandler: runtime.unregisterAbortHandler,
			unregisterPauseHandler: runtime.unregisterPauseHandler,
			unregisterUnpauseHandler: runtime.unregisterUnpauseHandler,
		});
		return result ?? NULL;
	} else {
		const fnScope = fn.scope.createChildScope();
		for (const [i, param] of fn.params.entries()) {
			const arg = args[i];
			if (!param.default) expectAny(arg);
			define(runtime, fnScope, param.dest, arg ?? param.default!, true);
		}

		const info: CallInfo = { name: fn.name ?? '<anonymous>', pos };
		return unWrapRet(runSync(runtime, fn.statements, fnScope, [...callStack, info]));
	}
}

export function define(runtime: EvalRuntime, scope: Scope, dest: Ast.Expression, value: Value, isMutable: boolean): void {
	switch (dest.type) {
		case 'identifier': {
			scope.add(dest.name, { isMutable, value });
			break;
		}
		case 'arr': {
			assertArray(value);
			dest.value.map(
				(item, index) => define(runtime, scope, item, value.value[index] ?? NULL, isMutable),
			);
			break;
		}
		case 'obj': {
			assertObject(value);
			[...dest.value].map(
				([key, item]) => define(runtime, scope, item, value.value.get(key) ?? NULL, isMutable),
			);
			break;
		}
		default: {
			throw new AiScriptRuntimeError('The left-hand side of an definition expression must be a variable.');
		}
	}
}

export async function getReference(runtime: EvalRuntime, dest: Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Promise<Reference | Control> {
	switch (dest.type) {
		case 'identifier': {
			return Reference.variable(dest.name, scope);
		}
		case 'index': {
			const assignee = await evalNode(runtime, dest.target, scope, callStack);
			if (isControl(assignee)) {
				return assignee;
			}
			const i = await evalNode(runtime, dest.index, scope, callStack);
			if (isControl(i)) {
				return i;
			}
			if (isArray(assignee)) {
				assertNumber(i);
				return Reference.index(assignee, i.value);
			} else if (isObject(assignee)) {
				assertString(i);
				return Reference.prop(assignee, i.value);
			} else {
				throw new AiScriptRuntimeError(`Cannot read prop (${reprValue(i)}) of ${assignee.type}.`);
			}
		}
		case 'prop': {
			const assignee = await evalNode(runtime, dest.target, scope, callStack);
			if (isControl(assignee)) {
				return assignee;
			}
			assertObject(assignee);

			return Reference.prop(assignee, dest.name);
		}
		case 'arr': {
			const items: Reference[] = [];
			for (const item of dest.value) {
				const ref = await getReference(runtime, item, scope, callStack);
				if (isControl(ref)) {
					return ref;
				}
				items.push(ref);
			}
			return Reference.arr(items);
		}
		case 'obj': {
			const entries = new Map<string, Reference>();
			for (const [key, item] of dest.value.entries()) {
				const ref = await getReference(runtime, item, scope, callStack);
				if (isControl(ref)) {
					return ref;
				}
				entries.set(key, ref);
			}
			return Reference.obj(entries);
		}
		default: {
			throw new AiScriptRuntimeError('The left-hand side of an assignment expression must be a variable or a property/index access.');
		}
	}
}

export function getReferenceSync(runtime: EvalRuntime, dest: Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Reference | Control {
	switch (dest.type) {
		case 'identifier': {
			return Reference.variable(dest.name, scope);
		}
		case 'index': {
			const assignee = evalNodeSync(runtime, dest.target, scope, callStack);
			if (isControl(assignee)) {
				return assignee;
			}
			const i = evalNodeSync(runtime, dest.index, scope, callStack);
			if (isControl(i)) {
				return i;
			}
			if (isArray(assignee)) {
				assertNumber(i);
				return Reference.index(assignee, i.value);
			} else if (isObject(assignee)) {
				assertString(i);
				return Reference.prop(assignee, i.value);
			} else {
				throw new AiScriptRuntimeError(`Cannot read prop (${reprValue(i)}) of ${assignee.type}.`);
			}
		}
		case 'prop': {
			const assignee = evalNodeSync(runtime, dest.target, scope, callStack);
			if (isControl(assignee)) {
				return assignee;
			}
			assertObject(assignee);

			return Reference.prop(assignee, dest.name);
		}
		case 'arr': {
			const items: Reference[] = [];
			for (const item of dest.value) {
				const ref = getReferenceSync(runtime, item, scope, callStack);
				if (isControl(ref)) {
					return ref;
				}
				items.push(ref);
			}
			return Reference.arr(items);
		}
		case 'obj': {
			const entries = new Map<string, Reference>();
			for (const [key, item] of dest.value.entries()) {
				const ref = getReferenceSync(runtime, item, scope, callStack);
				if (isControl(ref)) {
					return ref;
				}
				entries.set(key, ref);
			}
			return Reference.obj(entries);
		}
		default: {
			throw new AiScriptRuntimeError('The left-hand side of an assignment expression must be a variable or a property/index access.');
		}
	}
}

export async function setAttributes(runtime: EvalRuntime, attr: Ast.Attribute[], value: Value, scope: Scope, callStack: readonly CallInfo[]): Promise<void> {
	if (attr.length > 0) {
		const attrs: Value['attr'] = [];
		for (const nAttr of attr) {
			const value = await evalNode(runtime, nAttr.value, scope, callStack);
			assertValue(value);
			attrs.push({
				name: nAttr.name,
				value,
			});
		}
		value.attr = attrs;
	}
}

export function setAttributesSync(runtime: EvalRuntime, attr: Ast.Attribute[], value: Value, scope: Scope, callStack: readonly CallInfo[]): void {
	if (attr.length > 0) {
		const attrs: Value['attr'] = [];
		for (const nAttr of attr) {
			const value = evalNodeSync(runtime, nAttr.value, scope, callStack);
			assertValue(value);
			attrs.push({
				name: nAttr.name,
				value,
			});
		}
		value.attr = attrs;
	}
}

export function log(runtime: EvalRuntime, type: string, params: RuntimeLogObject): void {
	if (runtime.opts.log) runtime.opts.log(type, params);
}

async function evalNodeInner(runtime: EvalRuntime, node: Ast.Node, scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control> {
	if (runtime.stop) return NULL;
	if (runtime.pausing) await runtime.pausing.promise;
	// irqRateが小数の場合は不等間隔になる
	if (runtime.irqRate !== 0 && runtime.stepCount % runtime.irqRate >= runtime.irqRate - 1) {
		await runtime.irqSleep();
	}
	runtime.stepCount++;
	if (runtime.opts.maxStep && runtime.stepCount > runtime.opts.maxStep) {
		throw new AiScriptRuntimeError('max step exceeded');
	}
	return dispatch(runtime, node, scope, callStack);
}

function evalNodeInnerSync(runtime: EvalRuntime, node: Ast.Node, scope: Scope, callStack: readonly CallInfo[]): Value | Control {
	if (runtime.stop) return NULL;
	runtime.stepCount++;
	if (runtime.opts.maxStep && runtime.stepCount > runtime.opts.maxStep) {
		throw new AiScriptRuntimeError('max step exceeded');
	}
	return dispatchSync(runtime, node, scope, callStack);
}
