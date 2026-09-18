import { type Control } from '../control.js';
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
		case 'namedTypeSource':
		case 'fnTypeSource':
		case 'unionTypeSource':
		case 'attr': {
			throw new Error('invalid node type');
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
		case 'namedTypeSource':
		case 'fnTypeSource':
		case 'unionTypeSource':
		case 'attr': {
			throw new Error('invalid node type');
		}

		default: throw new Error('invalid node type');
	}
}
