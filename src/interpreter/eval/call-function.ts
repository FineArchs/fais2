import { isControl, type Control } from '../control.js';
import { assertFunction } from '../util.js';
import { FN, NULL, type Value, type VUserFn } from '../value.js';
import { evalNode, evalNodeSync, call, callSync } from './operations.js';
import type { PartialEvaluatorRecord } from './evaluator.js';

export const libEvalCallFunction = {
	call: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const callee = await evalNode(runtime, node.target, scope, callStack);
			if (isControl(callee)) {
				return callee;
			}
			assertFunction(callee);
			const args = [];
			for (const expr of node.args) {
				const arg = await evalNode(runtime, expr, scope, callStack);
				if (isControl(arg)) {
					return arg;
				}
				args.push(arg);
			}
			return call(runtime, callee, args, callStack, node.loc.start);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const callee = evalNodeSync(runtime, node.target, scope, callStack);
			if (isControl(callee)) {
				return callee;
			}
			assertFunction(callee);
			const args = [];
			for (const expr of node.args) {
				const arg = evalNodeSync(runtime, expr, scope, callStack);
				if (isControl(arg)) {
					return arg;
				}
				args.push(arg);
			}
			return callSync(runtime, callee, args, callStack, node.loc.start);
		},
	},
	fn: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const params = await Promise.all(node.params.map(async (param) => {
				return {
					dest: param.dest,
					default:
				param.default ? await evalNode(runtime, param.default, scope, callStack) :
				param.optional ? NULL :
				undefined,
					// type: (TODO)
				};
			}));
			const control = params
				.map((param) => param.default)
				.filter((value) => value != null)
				.find(isControl);
			if (control != null) {
				return control;
			}
			return FN(
		params as VUserFn['params'],
		node.children,
		scope,
			);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const params = node.params.map((param) => {
				return {
					dest: param.dest,
					default:
				param.default ? evalNodeSync(runtime, param.default, scope, callStack) :
				param.optional ? NULL :
				undefined,
					// type: (TODO)
				};
			});
			const control = params
				.map((param) => param.default)
				.filter((value) => value != null)
				.find(isControl);
			if (control != null) {
				return control;
			}
			return FN(
		params as VUserFn['params'],
		node.children,
		scope,
			);
		},
	},
} satisfies PartialEvaluatorRecord;
