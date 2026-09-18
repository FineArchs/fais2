import { type Control } from '../control.js';
import { BOOL, NULL, NUM, STR, type Value } from '../value.js';
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
		case 'null': return NULL;

		case 'bool': return BOOL(node.value);

		case 'num': return NUM(node.value);

		case 'str': return STR(node.value);

		case 'ns': {
			return NULL; // nop
		}

		case 'meta': {
			return NULL; // nop
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
		case 'null': return NULL;

		case 'bool': return BOOL(node.value);

		case 'num': return NUM(node.value);

		case 'str': return STR(node.value);

		case 'ns': {
			return NULL; // nop
		}

		case 'meta': {
			return NULL; // nop
		}

		default: throw new Error('invalid node type');
	}
}
