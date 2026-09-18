import { BREAK, CONTINUE, RETURN, isControl, unWrapLabeledBreak, type Control } from '../control.js';
import { type Value } from '../value.js';
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
		case 'block': {
			return unWrapLabeledBreak(await context.run(node.statements, scope.createChildScope(), callStack), node.label);
		}

		case 'return': {
			const val = await context.eval(node.expr, scope, callStack);
			if (isControl(val)) {
				return val;
			}
			context.log('block:return', { scope: scope.name, val: val });
			return RETURN(val);
		}

		case 'break': {
			let val: Value | undefined;
			if (node.expr != null) {
				const valueOrControl = await context.eval(node.expr, scope, callStack);
				if (isControl(valueOrControl)) {
					return valueOrControl;
				}
				val = valueOrControl;
			}
			context.log('block:break', { scope: scope.name });
			return BREAK(node.label, val);
		}

		case 'continue': {
			context.log('block:continue', { scope: scope.name });
			return CONTINUE(node.label);
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
		case 'block': {
			return unWrapLabeledBreak(context.runSync(node.statements, scope.createChildScope(), callStack), node.label);
		}

		case 'return': {
			const val = context.evalSync(node.expr, scope, callStack);
			if (isControl(val)) {
				return val;
			}
			context.log('block:return', { scope: scope.name, val: val });
			return RETURN(val);
		}

		case 'break': {
			let val: Value | undefined;
			if (node.expr != null) {
				const valueOrControl = context.evalSync(node.expr, scope, callStack);
				if (isControl(valueOrControl)) {
					return valueOrControl;
				}
				val = valueOrControl;
			}
			context.log('block:break', { scope: scope.name });
			return BREAK(node.label, val);
		}

		case 'continue': {
			context.log('block:continue', { scope: scope.name });
			return CONTINUE(node.label);
		}

		default: throw new Error('invalid node type');
	}
}
