import { isControl, type Control } from '../control.js';
import { assertFunction } from '../util.js';
import { FN, NULL, type Value, type VUserFn } from '../value.js';
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
		case 'call': {
			const callee = await context.eval(node.target, scope, callStack);
			if (isControl(callee)) {
				return callee;
			}
			assertFunction(callee);
			const args = [];
			for (const expr of node.args) {
				const arg = await context.eval(expr, scope, callStack);
				if (isControl(arg)) {
					return arg;
				}
				args.push(arg);
			}
			return context.call(callee, args, callStack, node.loc.start);
		}

		case 'fn': {
			const params = await Promise.all(node.params.map(async (param) => {
				return {
					dest: param.dest,
					default:
						param.default ? await context.eval(param.default, scope, callStack) :
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
	context: EvalContext,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Value | Control {
	switch (node.type) {
		case 'call': {
			const callee = context.evalSync(node.target, scope, callStack);
			if (isControl(callee)) {
				return callee;
			}
			assertFunction(callee);
			const args = [];
			for (const expr of node.args) {
				const arg = context.evalSync(expr, scope, callStack);
				if (isControl(arg)) {
					return arg;
				}
				args.push(arg);
			}
			return context.callSync(callee, args, callStack, node.loc.start);
		}

		case 'fn': {
			const params = node.params.map((param) => {
				return {
					dest: param.dest,
					default:
						param.default ? context.evalSync(param.default, scope, callStack) :
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
