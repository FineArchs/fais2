import { isControl, type Control } from '../control.js';
import { assertBoolean, assertNumber } from '../util.js';
import { BOOL, NUM, type Value } from '../value.js';
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
		case 'plus': {
			const v = await context.eval(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			return v;
		}

		case 'minus': {
			const v = await context.eval(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			return NUM(-v.value);
		}

		case 'not': {
			const v = await context.eval(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertBoolean(v);
			return BOOL(!v.value);
		}

		case 'pow': {
			return context.evalBinaryOperation('Core:pow', node.left, node.right, scope, callStack);
		}

		case 'mul': {
			return context.evalBinaryOperation('Core:mul', node.left, node.right, scope, callStack);
		}

		case 'div': {
			return context.evalBinaryOperation('Core:div', node.left, node.right, scope, callStack);
		}

		case 'rem': {
			return context.evalBinaryOperation('Core:mod', node.left, node.right, scope, callStack);
		}

		case 'add': {
			return context.evalBinaryOperation('Core:add', node.left, node.right, scope, callStack);
		}

		case 'sub': {
			return context.evalBinaryOperation('Core:sub', node.left, node.right, scope, callStack);
		}

		case 'lt': {
			return context.evalBinaryOperation('Core:lt', node.left, node.right, scope, callStack);
		}

		case 'lteq': {
			return context.evalBinaryOperation('Core:lteq', node.left, node.right, scope, callStack);
		}

		case 'gt': {
			return context.evalBinaryOperation('Core:gt', node.left, node.right, scope, callStack);
		}

		case 'gteq': {
			return context.evalBinaryOperation('Core:gteq', node.left, node.right, scope, callStack);
		}

		case 'eq': {
			return context.evalBinaryOperation('Core:eq', node.left, node.right, scope, callStack);
		}

		case 'neq': {
			return context.evalBinaryOperation('Core:neq', node.left, node.right, scope, callStack);
		}

		case 'and': {
			const leftValue = await context.eval(node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			assertBoolean(leftValue);

			if (!leftValue.value) {
				return leftValue;
			} else {
				const rightValue = await context.eval(node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				assertBoolean(rightValue);
				return rightValue;
			}
		}

		case 'or': {
			const leftValue = await context.eval(node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			assertBoolean(leftValue);

			if (leftValue.value) {
				return leftValue;
			} else {
				const rightValue = await context.eval(node.right, scope, callStack);
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
	context: EvalContext,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Value | Control {
	switch (node.type) {
		case 'plus': {
			const v = context.evalSync(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			return v;
		}

		case 'minus': {
			const v = context.evalSync(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			return NUM(-v.value);
		}

		case 'not': {
			const v = context.evalSync(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertBoolean(v);
			return BOOL(!v.value);
		}

		case 'pow': {
			return context.evalBinaryOperationSync('Core:pow', node.left, node.right, scope, callStack);
		}

		case 'mul': {
			return context.evalBinaryOperationSync('Core:mul', node.left, node.right, scope, callStack);
		}

		case 'div': {
			return context.evalBinaryOperationSync('Core:div', node.left, node.right, scope, callStack);
		}

		case 'rem': {
			return context.evalBinaryOperationSync('Core:mod', node.left, node.right, scope, callStack);
		}

		case 'add': {
			return context.evalBinaryOperationSync('Core:add', node.left, node.right, scope, callStack);
		}

		case 'sub': {
			return context.evalBinaryOperationSync('Core:sub', node.left, node.right, scope, callStack);
		}

		case 'lt': {
			return context.evalBinaryOperationSync('Core:lt', node.left, node.right, scope, callStack);
		}

		case 'lteq': {
			return context.evalBinaryOperationSync('Core:lteq', node.left, node.right, scope, callStack);
		}

		case 'gt': {
			return context.evalBinaryOperationSync('Core:gt', node.left, node.right, scope, callStack);
		}

		case 'gteq': {
			return context.evalBinaryOperationSync('Core:gteq', node.left, node.right, scope, callStack);
		}

		case 'eq': {
			return context.evalBinaryOperationSync('Core:eq', node.left, node.right, scope, callStack);
		}

		case 'neq': {
			return context.evalBinaryOperationSync('Core:neq', node.left, node.right, scope, callStack);
		}

		case 'and': {
			const leftValue = context.evalSync(node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			assertBoolean(leftValue);

			if (!leftValue.value) {
				return leftValue;
			} else {
				const rightValue = context.evalSync(node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				assertBoolean(rightValue);
				return rightValue;
			}
		}

		case 'or': {
			const leftValue = context.evalSync(node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			assertBoolean(leftValue);

			if (leftValue.value) {
				return leftValue;
			} else {
				const rightValue = context.evalSync(node.right, scope, callStack);
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
