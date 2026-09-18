import { isControl, unWrapLabeledBreak, type Control } from '../control.js';
import { assertBoolean, eq } from '../util.js';
import { NULL, type Value } from '../value.js';
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
		case 'if': {
			const cond = await context.eval(node.cond, scope, callStack);
			if (isControl(cond)) {
				return cond;
			}
			assertBoolean(cond);
			if (cond.value) {
				return unWrapLabeledBreak(await context.evalClause(node.then, scope, callStack), node.label);
			}
			for (const elseif of node.elseif) {
				const cond = await context.eval(elseif.cond, scope, callStack);
				if (isControl(cond)) {
					return cond;
				}
				assertBoolean(cond);
				if (cond.value) {
					return unWrapLabeledBreak(await context.evalClause(elseif.then, scope, callStack), node.label);
				}
			}
			if (node.else) {
				return unWrapLabeledBreak(await context.evalClause(node.else, scope, callStack), node.label);
			}
			return NULL;
		}

		case 'match': {
			const about = await context.eval(node.about, scope, callStack);
			if (isControl(about)) {
				return about;
			}
			for (const qa of node.qs) {
				const q = await context.eval(qa.q, scope, callStack);
				if (isControl(q)) {
					return q;
				}
				if (eq(about, q)) {
					return unWrapLabeledBreak(await context.evalClause(qa.a, scope, callStack), node.label);
				}
			}
			if (node.default) {
				return unWrapLabeledBreak(await context.evalClause(node.default, scope, callStack), node.label);
			}
			return NULL;
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
		case 'if': {
			const cond = context.evalSync(node.cond, scope, callStack);
			if (isControl(cond)) {
				return cond;
			}
			assertBoolean(cond);
			if (cond.value) {
				return unWrapLabeledBreak(context.evalClauseSync(node.then, scope, callStack), node.label);
			}
			for (const elseif of node.elseif) {
				const cond = context.evalSync(elseif.cond, scope, callStack);
				if (isControl(cond)) {
					return cond;
				}
				assertBoolean(cond);
				if (cond.value) {
					return unWrapLabeledBreak(context.evalClauseSync(elseif.then, scope, callStack), node.label);
				}
			}
			if (node.else) {
				return unWrapLabeledBreak(context.evalClauseSync(node.else, scope, callStack), node.label);
			}
			return NULL;
		}

		case 'match': {
			const about = context.evalSync(node.about, scope, callStack);
			if (isControl(about)) {
				return about;
			}
			for (const qa of node.qs) {
				const q = context.evalSync(qa.q, scope, callStack);
				if (isControl(q)) {
					return q;
				}
				if (eq(about, q)) {
					return unWrapLabeledBreak(context.evalClauseSync(qa.a, scope, callStack), node.label);
				}
			}
			if (node.default) {
				return unWrapLabeledBreak(context.evalClauseSync(node.default, scope, callStack), node.label);
			}
			return NULL;
		}

		default: throw new Error('invalid node type');
	}
}
