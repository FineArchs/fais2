import { BREAK, CONTINUE, RETURN, isControl, unWrapLabeledBreak, type Control } from '../control.js';
import { type Value } from '../value.js';
import { evalNode, evalNodeSync, run, runSync, log } from './operations.js';
import type { PartialEvaluatorRecord } from './evaluator.js';

export const libEvalControlFlow = {
	block: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return unWrapLabeledBreak(await run(runtime, node.statements, scope.createChildScope(), callStack), node.label);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return unWrapLabeledBreak(runSync(runtime, node.statements, scope.createChildScope(), callStack), node.label);
		},
	},
	return: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const val = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(val)) {
				return val;
			}
			log(runtime, 'block:return', { scope: scope.name, val: val });
			return RETURN(val);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const val = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(val)) {
				return val;
			}
			log(runtime, 'block:return', { scope: scope.name, val: val });
			return RETURN(val);
		},
	},
	break: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			let val: Value | undefined;
			if (node.expr != null) {
				const valueOrControl = await evalNode(runtime, node.expr, scope, callStack);
				if (isControl(valueOrControl)) {
					return valueOrControl;
				}
				val = valueOrControl;
			}
			log(runtime, 'block:break', { scope: scope.name });
			return BREAK(node.label, val);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			let val: Value | undefined;
			if (node.expr != null) {
				const valueOrControl = evalNodeSync(runtime, node.expr, scope, callStack);
				if (isControl(valueOrControl)) {
					return valueOrControl;
				}
				val = valueOrControl;
			}
			log(runtime, 'block:break', { scope: scope.name });
			return BREAK(node.label, val);
		},
	},
	continue: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			log(runtime, 'block:continue', { scope: scope.name });
			return CONTINUE(node.label);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			log(runtime, 'block:continue', { scope: scope.name });
			return CONTINUE(node.label);
		},
	},
} satisfies PartialEvaluatorRecord;
