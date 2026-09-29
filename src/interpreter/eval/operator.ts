import { isControl, type Control } from '../control.js';
import { ValueTypeUtil as V } from '../util.js';
import { BOOL, NUM, type Value } from '../value.js';
import { evalNode, evalNodeSync, evalBinaryOperation, evalBinaryOperationSync } from './operations.js';
import type { PartialEvaluatorRecord } from './evaluator.js';

export const libEvalOperator = {
	plus: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'num');
			return v;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'num');
			return v;
		},
	},
	minus: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'num');
			return NUM(-v.value);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'num');
			return NUM(-v.value);
		},
	},
	not: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'bool');
			return BOOL(!v.value);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'bool');
			return BOOL(!v.value);
		},
	},
	pow: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:pow', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:pow', node.left, node.right, scope, callStack);
		},
	},
	mul: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:mul', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:mul', node.left, node.right, scope, callStack);
		},
	},
	div: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:div', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:div', node.left, node.right, scope, callStack);
		},
	},
	rem: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:mod', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:mod', node.left, node.right, scope, callStack);
		},
	},
	add: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:add', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:add', node.left, node.right, scope, callStack);
		},
	},
	sub: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:sub', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:sub', node.left, node.right, scope, callStack);
		},
	},
	lt: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:lt', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:lt', node.left, node.right, scope, callStack);
		},
	},
	lteq: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:lteq', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:lteq', node.left, node.right, scope, callStack);
		},
	},
	gt: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:gt', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:gt', node.left, node.right, scope, callStack);
		},
	},
	gteq: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:gteq', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:gteq', node.left, node.right, scope, callStack);
		},
	},
	eq: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:eq', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:eq', node.left, node.right, scope, callStack);
		},
	},
	neq: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return evalBinaryOperation(runtime, 'Core:neq', node.left, node.right, scope, callStack);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return evalBinaryOperationSync(runtime, 'Core:neq', node.left, node.right, scope, callStack);
		},
	},
	and: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const leftValue = await evalNode(runtime, node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			V.assert(leftValue, 'bool');
		
			if (!leftValue.value) {
				return leftValue;
			} else {
				const rightValue = await evalNode(runtime, node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				V.assert(rightValue, 'bool');
				return rightValue;
			}
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const leftValue = evalNodeSync(runtime, node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			V.assert(leftValue, 'bool');
		
			if (!leftValue.value) {
				return leftValue;
			} else {
				const rightValue = evalNodeSync(runtime, node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				V.assert(rightValue, 'bool');
				return rightValue;
			}
		},
	},
	or: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const leftValue = await evalNode(runtime, node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			V.assert(leftValue, 'bool');
		
			if (leftValue.value) {
				return leftValue;
			} else {
				const rightValue = await evalNode(runtime, node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				V.assert(rightValue, 'bool');
				return rightValue;
			}
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const leftValue = evalNodeSync(runtime, node.left, scope, callStack);
			if (isControl(leftValue)) {
				return leftValue;
			}
			V.assert(leftValue, 'bool');
		
			if (leftValue.value) {
				return leftValue;
			} else {
				const rightValue = evalNodeSync(runtime, node.right, scope, callStack);
				if (isControl(rightValue)) {
					return rightValue;
				}
				V.assert(rightValue, 'bool');
				return rightValue;
			}
		},
	},
} satisfies PartialEvaluatorRecord;
