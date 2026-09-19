import { isControl, type Control } from '../control.js';
import { assertNumber, isFunction } from '../util.js';
import { BOOL, NULL, NUM, type Value } from '../value.js';
import { evalNode, evalNodeSync, define, getReference, getReferenceSync, setAttributes, setAttributesSync } from './operations.js';
import type * as Ast from '../../node.js';
import type { Scope } from '../scope.js';
import type { CallInfo, EvalRuntime } from './runtime.js';

export async function evaluate(
	runtime: EvalRuntime,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Promise<Value | Control> {
	switch (node.type) {
		case 'def': {
			const value = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(value)) {
				return value;
			}
			await setAttributes(runtime, node.attr, value, scope, callStack);
			if (
				node.expr.type === 'fn'
				&& node.dest.type === 'identifier'
				&& isFunction(value)
				&& !value.native
			) {
				value.name = node.dest.name;
			}
			define(runtime, scope, node.dest, value, node.mut);
			return NULL;
		}

		case 'identifier': {
			return scope.get(node.name);
		}

		case 'assign': {
			const target = await getReference(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}

			target.set(v);

			return NULL;
		}

		case 'addAssign': {
			const target = await getReference(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			const targetValue = target.get();
			assertNumber(targetValue);

			target.set(NUM(targetValue.value + v.value));
			return NULL;
		}

		case 'subAssign': {
			const target = await getReference(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			const targetValue = target.get();
			assertNumber(targetValue);

			target.set(NUM(targetValue.value - v.value));
			return NULL;
		}

		case 'exists': {
			return BOOL(scope.exists(node.identifier.name));
		}

		default: throw new Error('invalid node type');
	}
}

export function evaluateSync(
	runtime: EvalRuntime,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Value | Control {
	switch (node.type) {
		case 'def': {
			const value = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(value)) {
				return value;
			}
			setAttributesSync(runtime, node.attr, value, scope, callStack);
			if (
				node.expr.type === 'fn'
				&& node.dest.type === 'identifier'
				&& isFunction(value)
				&& !value.native
			) {
				value.name = node.dest.name;
			}
			define(runtime, scope, node.dest, value, node.mut);
			return NULL;
		}

		case 'identifier': {
			return scope.get(node.name);
		}

		case 'assign': {
			const target = getReferenceSync(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}

			target.set(v);

			return NULL;
		}

		case 'addAssign': {
			const target = getReferenceSync(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			const targetValue = target.get();
			assertNumber(targetValue);

			target.set(NUM(targetValue.value + v.value));
			return NULL;
		}

		case 'subAssign': {
			const target = getReferenceSync(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			const targetValue = target.get();
			assertNumber(targetValue);

			target.set(NUM(targetValue.value - v.value));
			return NULL;
		}

		case 'exists': {
			return BOOL(scope.exists(node.identifier.name));
		}

		default: throw new Error('invalid node type');
	}
}
