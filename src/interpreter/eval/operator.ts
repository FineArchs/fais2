import { isControl, type Control } from '../control.js';
import { assertBoolean, assertNumber } from '../util.js';
import { BOOL, NUM, type Value } from '../value.js';
import { evalNode, evalNodeSync, evalBinaryOperation, evalBinaryOperationSync } from './operations.js';
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
		case 'plus': {
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			return v;
		}

		case 'minus': {
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			return NUM(-v.value);
		}

		case 'not': {
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertBoolean(v);
			return BOOL(!v.value);
		}

		case 'pow': {
			return evalBinaryOperation(runtime, 'Core:pow', node.left, node.right, scope, callStack);
		}

		case 'mul': {
			return evalBinaryOperation(runtime, 'Core:mul', node.left, node.right, scope, callStack);
		}

		case 'div': {
			return evalBinaryOperation(runtime, 'Core:div', node.left, node.right, scope, callStack);
		}

		case 'rem': {
			return evalBinaryOperation(runtime, 'Core:mod', node.left, node.right, scope, callStack);
		}

		case 'add': {
			return evalBinaryOperation(runtime, 'Core:add', node.left, node.right, scope, callStack);
		}

		case 'sub': {
			return evalBinaryOperation(runtime, 'Core:sub', node.left, node.right, scope, callStack);
		}

		case 'lt': {
			return evalBinaryOperation(runtime, 'Core:lt', node.left, node.right, scope, callStack);
		}

		case 'lteq': {
			return evalBinaryOperation(runtime, 'Core:lteq', node.left, node.right, scope, callStack);
		}

		case 'gt': {
			return evalBinaryOperation(runtime, 'Core:gt', node.left, node.right, scope, callStack);
		}

		case 'gteq': {
			return evalBinaryOperation(runtime, 'Core:gteq', node.left, node.right, scope, callStack);
		}

		case 'eq': {
			return evalBinaryOperation(runtime, 'Core:eq', node.left, node.right, scope, callStack);
		}

		case 'neq': {
			return evalBinaryOperation(runtime, 'Core:neq', node.left, node.right, scope, callStack);
		}

		case 'and': {
			const leftValue = await evalNode(runtime, node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			assertBoolean(leftValue);

			if (!leftValue.value) {
				return leftValue;
			} else {
				const rightValue = await evalNode(runtime, node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				assertBoolean(rightValue);
				return rightValue;
			}
		}

		case 'or': {
			const leftValue = await evalNode(runtime, node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			assertBoolean(leftValue);

			if (leftValue.value) {
				return leftValue;
			} else {
				const rightValue = await evalNode(runtime, node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				assertBoolean(rightValue);
				return rightValue;
			}
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
		case 'plus': {
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			return v;
		}

		case 'minus': {
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			return NUM(-v.value);
		}

		case 'not': {
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertBoolean(v);
			return BOOL(!v.value);
		}

		case 'pow': {
			return evalBinaryOperationSync(runtime, 'Core:pow', node.left, node.right, scope, callStack);
		}

		case 'mul': {
			return evalBinaryOperationSync(runtime, 'Core:mul', node.left, node.right, scope, callStack);
		}

		case 'div': {
			return evalBinaryOperationSync(runtime, 'Core:div', node.left, node.right, scope, callStack);
		}

		case 'rem': {
			return evalBinaryOperationSync(runtime, 'Core:mod', node.left, node.right, scope, callStack);
		}

		case 'add': {
			return evalBinaryOperationSync(runtime, 'Core:add', node.left, node.right, scope, callStack);
		}

		case 'sub': {
			return evalBinaryOperationSync(runtime, 'Core:sub', node.left, node.right, scope, callStack);
		}

		case 'lt': {
			return evalBinaryOperationSync(runtime, 'Core:lt', node.left, node.right, scope, callStack);
		}

		case 'lteq': {
			return evalBinaryOperationSync(runtime, 'Core:lteq', node.left, node.right, scope, callStack);
		}

		case 'gt': {
			return evalBinaryOperationSync(runtime, 'Core:gt', node.left, node.right, scope, callStack);
		}

		case 'gteq': {
			return evalBinaryOperationSync(runtime, 'Core:gteq', node.left, node.right, scope, callStack);
		}

		case 'eq': {
			return evalBinaryOperationSync(runtime, 'Core:eq', node.left, node.right, scope, callStack);
		}

		case 'neq': {
			return evalBinaryOperationSync(runtime, 'Core:neq', node.left, node.right, scope, callStack);
		}

		case 'and': {
			const leftValue = evalNodeSync(runtime, node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			assertBoolean(leftValue);

			if (!leftValue.value) {
				return leftValue;
			} else {
				const rightValue = evalNodeSync(runtime, node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				assertBoolean(rightValue);
				return rightValue;
			}
		}

		case 'or': {
			const leftValue = evalNodeSync(runtime, node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			assertBoolean(leftValue);

			if (leftValue.value) {
				return leftValue;
			} else {
				const rightValue = evalNodeSync(runtime, node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				assertBoolean(rightValue);
				return rightValue;
			}
		}

		default: throw new Error('invalid node type');
	}
}
