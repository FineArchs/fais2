import { isControl, unWrapLabeledBreak, type Control } from '../control.js';
import { eq, ValueTypeUtil as V } from '../util.js';
import { NULL, type Value } from '../value.js';
import { evalNode, evalNodeSync, evalClause, evalClauseSync } from './operations.js';
import type { PartialEvaluatorRecord } from './evaluator.js';

export const libEvalCondition = {
	if: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const cond = await evalNode(runtime, node.cond, scope, callStack);
			if (isControl(cond)) {
				return cond;
			}
			V.assert(cond, 'bool');
			if (cond.value) {
				return unWrapLabeledBreak(await evalClause(runtime, node.then, scope, callStack), node.label);
			}
			for (const elseif of node.elseif) {
				const cond = await evalNode(runtime, elseif.cond, scope, callStack);
				if (isControl(cond)) {
					return cond;
				}
				V.assert(cond, 'bool');
				if (cond.value) {
					return unWrapLabeledBreak(await evalClause(runtime, elseif.then, scope, callStack), node.label);
				}
			}
			if (node.else) {
				return unWrapLabeledBreak(await evalClause(runtime, node.else, scope, callStack), node.label);
			}
			return NULL;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const cond = evalNodeSync(runtime, node.cond, scope, callStack);
			if (isControl(cond)) {
				return cond;
			}
			V.assert(cond, 'bool');
			if (cond.value) {
				return unWrapLabeledBreak(evalClauseSync(runtime, node.then, scope, callStack), node.label);
			}
			for (const elseif of node.elseif) {
				const cond = evalNodeSync(runtime, elseif.cond, scope, callStack);
				if (isControl(cond)) {
					return cond;
				}
				V.assert(cond, 'bool');
				if (cond.value) {
					return unWrapLabeledBreak(evalClauseSync(runtime, elseif.then, scope, callStack), node.label);
				}
			}
			if (node.else) {
				return unWrapLabeledBreak(evalClauseSync(runtime, node.else, scope, callStack), node.label);
			}
			return NULL;
		},
	},
	match: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
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
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
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
		},
	},
} satisfies PartialEvaluatorRecord;
