import { BREAK, CONTINUE, RETURN, isControl, unWrapLabeledBreak, type Control } from '../control.js';
import { type Value } from '../value.js';
import { evalNode, evalNodeSync, run, runSync, log } from './operations.js';
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
		case 'block': {
			return unWrapLabeledBreak(await run(runtime, node.statements, scope.createChildScope(), callStack), node.label);
		}

		case 'return': {
			const val = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(val)) {
				return val;
			}
			log(runtime, 'block:return', { scope: scope.name, val: val });
			return RETURN(val);
		}

		case 'break': {
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
		}

		case 'continue': {
			log(runtime, 'block:continue', { scope: scope.name });
			return CONTINUE(node.label);
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
		case 'block': {
			return unWrapLabeledBreak(runSync(runtime, node.statements, scope.createChildScope(), callStack), node.label);
		}

		case 'return': {
			const val = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(val)) {
				return val;
			}
			log(runtime, 'block:return', { scope: scope.name, val: val });
			return RETURN(val);
		}

		case 'break': {
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
		}

		case 'continue': {
			log(runtime, 'block:continue', { scope: scope.name });
			return CONTINUE(node.label);
		}

		default: throw new Error('invalid node type');
	}
}
