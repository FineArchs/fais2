import { isControl, type Control } from '../control.js';
import { assertNumber, isFunction } from '../util.js';
import { BOOL, NULL, NUM, type Value } from '../value.js';
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
		case 'def': {
			const value = await context.eval(node.expr, scope, callStack);
			if (isControl(value)) {
				return value;
			}
			await context.setAttributes(node.attr, value, scope, callStack);
			if (
				node.expr.type === 'fn'
				&& node.dest.type === 'identifier'
				&& isFunction(value)
				&& !value.native
			) {
				value.name = node.dest.name;
			}
			context.define(scope, node.dest, value, node.mut);
			return NULL;
		}

		case 'identifier': {
			return scope.get(node.name);
		}

		case 'assign': {
			const target = await context.getReference(node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await context.eval(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}

			target.set(v);

			return NULL;
		}

		case 'addAssign': {
			const target = await context.getReference(node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await context.eval(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			const targetValue = target.get();
			assertNumber(targetValue);

			target.set(NUM(targetValue.value + v.value));
			return NULL;
		}

		case 'subAssign': {
			const target = await context.getReference(node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await context.eval(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			const targetValue = target.get();
			assertNumber(targetValue);

			target.set(NUM(targetValue.value - v.value));
			return NULL;
		}

		case 'exists': {
			return BOOL(scope.exists(node.identifier.name));
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
		case 'def': {
			const value = context.evalSync(node.expr, scope, callStack);
			if (isControl(value)) {
				return value;
			}
			context.setAttributesSync(node.attr, value, scope, callStack);
			if (
				node.expr.type === 'fn'
				&& node.dest.type === 'identifier'
				&& isFunction(value)
				&& !value.native
			) {
				value.name = node.dest.name;
			}
			context.define(scope, node.dest, value, node.mut);
			return NULL;
		}

		case 'identifier': {
			return scope.get(node.name);
		}

		case 'assign': {
			const target = context.getReferenceSync(node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = context.evalSync(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}

			target.set(v);

			return NULL;
		}

		case 'addAssign': {
			const target = context.getReferenceSync(node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = context.evalSync(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			const targetValue = target.get();
			assertNumber(targetValue);

			target.set(NUM(targetValue.value + v.value));
			return NULL;
		}

		case 'subAssign': {
			const target = context.getReferenceSync(node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = context.evalSync(node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			assertNumber(v);
			const targetValue = target.get();
			assertNumber(targetValue);

			target.set(NUM(targetValue.value - v.value));
			return NULL;
		}

		case 'exists': {
			return BOOL(scope.exists(node.identifier.name));
		}

		default: throw new Error('invalid node type');
	}
}
