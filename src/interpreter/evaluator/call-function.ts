import { isControl, type Control } from '../control.js';
import { assertFunction } from '../util.js';
import { FN, NULL, type Value, type VUserFn } from '../value.js';
import { evalNode, evalNodeSync, call, callSync } from './operations.js';
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
		case 'call': {
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
		}

		case 'fn': {
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
		case 'call': {
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
		}

		case 'fn': {
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
		}

		default: throw new Error('invalid node type');
	}
}
