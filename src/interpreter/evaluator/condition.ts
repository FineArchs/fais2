import { isControl, unWrapLabeledBreak, type Control } from '../control.js';
import { assertBoolean, eq } from '../util.js';
import { NULL, type Value } from '../value.js';
import { evalNode, evalNodeSync, evalClause, evalClauseSync } from './operations.js';
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
		case 'if': {
			const cond = await evalNode(runtime, node.cond, scope, callStack);
			if (isControl(cond)) {
				return cond;
			}
			assertBoolean(cond);
			if (cond.value) {
				return unWrapLabeledBreak(await evalClause(runtime, node.then, scope, callStack), node.label);
			}
			for (const elseif of node.elseif) {
				const cond = await evalNode(runtime, elseif.cond, scope, callStack);
				if (isControl(cond)) {
					return cond;
				}
				assertBoolean(cond);
				if (cond.value) {
					return unWrapLabeledBreak(await evalClause(runtime, elseif.then, scope, callStack), node.label);
				}
			}
			if (node.else) {
				return unWrapLabeledBreak(await evalClause(runtime, node.else, scope, callStack), node.label);
			}
			return NULL;
		}

		case 'match': {
			const about = await evalNode(runtime, node.about, scope, callStack);
			if (isControl(about)) {
				return about;
			}
			for (const qa of node.qs) {
				const q = await evalNode(runtime, qa.q, scope, callStack);
				if (isControl(q)) {
					return q;
				}
				if (eq(about, q)) {
					return unWrapLabeledBreak(await evalClause(runtime, qa.a, scope, callStack), node.label);
				}
			}
			if (node.default) {
				return unWrapLabeledBreak(await evalClause(runtime, node.default, scope, callStack), node.label);
			}
			return NULL;
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
		case 'if': {
			const cond = evalNodeSync(runtime, node.cond, scope, callStack);
			if (isControl(cond)) {
				return cond;
			}
			assertBoolean(cond);
			if (cond.value) {
				return unWrapLabeledBreak(evalClauseSync(runtime, node.then, scope, callStack), node.label);
			}
			for (const elseif of node.elseif) {
				const cond = evalNodeSync(runtime, elseif.cond, scope, callStack);
				if (isControl(cond)) {
					return cond;
				}
				assertBoolean(cond);
				if (cond.value) {
					return unWrapLabeledBreak(evalClauseSync(runtime, elseif.then, scope, callStack), node.label);
				}
			}
			if (node.else) {
				return unWrapLabeledBreak(evalClauseSync(runtime, node.else, scope, callStack), node.label);
			}
			return NULL;
		}

		case 'match': {
			const about = evalNodeSync(runtime, node.about, scope, callStack);
			if (isControl(about)) {
				return about;
			}
			for (const qa of node.qs) {
				const q = evalNodeSync(runtime, qa.q, scope, callStack);
				if (isControl(q)) {
					return q;
				}
				if (eq(about, q)) {
					return unWrapLabeledBreak(evalClauseSync(runtime, qa.a, scope, callStack), node.label);
				}
			}
			if (node.default) {
				return unWrapLabeledBreak(evalClauseSync(runtime, node.default, scope, callStack), node.label);
			}
			return NULL;
		}

		default: throw new Error('invalid node type');
	}
}
