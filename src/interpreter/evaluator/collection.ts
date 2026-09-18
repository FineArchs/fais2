import { AiScriptIndexOutOfRangeError, AiScriptRuntimeError } from '../../error.js';
import { isControl, type Control } from '../control.js';
import { getPrimProp } from '../primitive-props.js';
import { assertNumber, assertString, isArray, isObject, reprValue } from '../util.js';
import { ARR, NULL, OBJ, STR, type Value } from '../value.js';
import type * as Ast from '../../node.js';
import type { Scope } from '../scope.js';
import type { CallInfo, EvalContext } from './context.js';

export async function evaluate(
	context: EvalContext,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Promise<Value | Control> {
	switch (node.type) {
		case 'arr': {
			const value = [];
			for (const item of node.value) {
				const valueItem = await context.eval(item, scope, callStack);
				if (isControl(valueItem)) {
					return valueItem;
				}
				value.push(valueItem);
			}
			return ARR(value);
		}

		case 'obj': {
			const obj = new Map<string, Value>();
			for (const [key, valueExpr] of node.value) {
				const value = await context.eval(valueExpr, scope, callStack);
				if (isControl(value)) {
					return value;
				}
				obj.set(key, value);
			}
			return OBJ(obj);
		}

		case 'prop': {
			const target = await context.eval(node.target, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			if (isObject(target)) {
				if (target.value.has(node.name)) {
					return target.value.get(node.name)!;
				} else {
					return NULL;
				}
			} else {
				return getPrimProp(target, node.name);
			}
		}

		case 'index': {
			const target = await context.eval(node.target, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const i = await context.eval(node.index, scope, callStack);
			if (isControl(i)) {
				return i;
			}
			if (isArray(target)) {
				assertNumber(i);
				const item = target.value[i.value];
				if (item === undefined) {
					throw new AiScriptIndexOutOfRangeError(`Index out of range. index: ${i.value} max: ${target.value.length - 1}`);
				}
				return item;
			} else if (isObject(target)) {
				assertString(i);
				if (target.value.has(i.value)) {
					return target.value.get(i.value)!;
				} else {
					return NULL;
				}
			} else {
				throw new AiScriptRuntimeError(`Cannot read prop (${reprValue(i)}) of ${target.type}.`);
			}
		}

		case 'tmpl': {
			let str = '';
			for (const x of node.tmpl) {
				const v = await context.eval(x, scope, callStack);
				if (isControl(v)) {
					return v;
				}
				str += reprValue(v);
			}
			return STR(str);
		}

		default: throw new Error('invalid node type');
	}
}

export function evaluateSync(
	context: EvalContext,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Value | Control {
	switch (node.type) {
		case 'arr': {
			const value = [];
			for (const item of node.value) {
				const valueItem = context.evalSync(item, scope, callStack);
				if (isControl(valueItem)) {
					return valueItem;
				}
				value.push(valueItem);
			}
			return ARR(value);
		}

		case 'obj': {
			const obj = new Map<string, Value>();
			for (const [key, valueExpr] of node.value) {
				const value = context.evalSync(valueExpr, scope, callStack);
				if (isControl(value)) {
					return value;
				}
				obj.set(key, value);
			}
			return OBJ(obj);
		}

		case 'prop': {
			const target = context.evalSync(node.target, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			if (isObject(target)) {
				if (target.value.has(node.name)) {
					return target.value.get(node.name)!;
				} else {
					return NULL;
				}
			} else {
				return getPrimProp(target, node.name);
			}
		}

		case 'index': {
			const target = context.evalSync(node.target, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const i = context.evalSync(node.index, scope, callStack);
			if (isControl(i)) {
				return i;
			}
			if (isArray(target)) {
				assertNumber(i);
				const item = target.value[i.value];
				if (item === undefined) {
					throw new AiScriptIndexOutOfRangeError(`Index out of range. index: ${i.value} max: ${target.value.length - 1}`);
				}
				return item;
			} else if (isObject(target)) {
				assertString(i);
				if (target.value.has(i.value)) {
					return target.value.get(i.value)!;
				} else {
					return NULL;
				}
			} else {
				throw new AiScriptRuntimeError(`Cannot read prop (${reprValue(i)}) of ${target.type}.`);
			}
		}

		case 'tmpl': {
			let str = '';
			for (const x of node.tmpl) {
				const v = context.evalSync(x, scope, callStack);
				if (isControl(v)) {
					return v;
				}
				str += reprValue(v);
			}
			return STR(str);
		}

		default: throw new Error('invalid node type');
	}
}
