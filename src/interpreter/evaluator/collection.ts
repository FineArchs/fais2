import { AiScriptIndexOutOfRangeError, AiScriptRuntimeError } from '../../error.js';
import { isControl, type Control } from '../control.js';
import { getPrimProp } from '../primitive-props.js';
import { assertNumber, assertString, isArray, isObject, reprValue } from '../util.js';
import { ARR, NULL, OBJ, STR, type Value } from '../value.js';
import { evalNode, evalNodeSync } from './operations.js';
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
		case 'arr': {
			const value = [];
			for (const item of node.value) {
				const valueItem = await evalNode(runtime, item, scope, callStack);
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
				const value = await evalNode(runtime, valueExpr, scope, callStack);
				if (isControl(value)) {
					return value;
				}
				obj.set(key, value);
			}
			return OBJ(obj);
		}

		case 'prop': {
			const target = await evalNode(runtime, node.target, scope, callStack);
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
			const target = await evalNode(runtime, node.target, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const i = await evalNode(runtime, node.index, scope, callStack);
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
				const v = await evalNode(runtime, x, scope, callStack);
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
	runtime: EvalRuntime,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Value | Control {
	switch (node.type) {
		case 'arr': {
			const value = [];
			for (const item of node.value) {
				const valueItem = evalNodeSync(runtime, item, scope, callStack);
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
				const value = evalNodeSync(runtime, valueExpr, scope, callStack);
				if (isControl(value)) {
					return value;
				}
				obj.set(key, value);
			}
			return OBJ(obj);
		}

		case 'prop': {
			const target = evalNodeSync(runtime, node.target, scope, callStack);
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
			const target = evalNodeSync(runtime, node.target, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const i = evalNodeSync(runtime, node.index, scope, callStack);
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
				const v = evalNodeSync(runtime, x, scope, callStack);
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
