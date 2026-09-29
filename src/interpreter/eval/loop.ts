import { isControl, type Control } from '../control.js';
import { ValueTypeUtil as V } from '../util.js';
import { NULL, NUM, type Value } from '../value.js';
import { evalNode, evalNodeSync, evalClause, evalClauseSync, run, runSync, define } from './operations.js';
import type { PartialEvaluatorRecord } from './evaluator.js';

export const libEvalLoop = {
	loop: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			while (true) {
				const v = await run(runtime, node.statements, scope.createChildScope(), callStack);
				if (v.type === 'break') {
					if (v.label != null && v.label !== node.label) {
						return v;
					}
					break;
				} else if (v.type === 'continue') {
					if (v.label != null && v.label !== node.label) {
						return v;
					}
				} else if (v.type === 'return') {
					return v;
				}
			}
			return NULL;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			while (true) {
				const v = runSync(runtime, node.statements, scope.createChildScope(), callStack);
				if (v.type === 'break') {
					if (v.label != null && v.label !== node.label) {
						return v;
					}
					break;
				} else if (v.type === 'continue') {
					if (v.label != null && v.label !== node.label) {
						return v;
					}
				} else if (v.type === 'return') {
					return v;
				}
			}
			return NULL;
		},
	},
	for: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			if (node.times) {
				const times = await evalNode(runtime, node.times, scope, callStack);
				if (isControl(times)) {
					return times;
				}
				V.assert(times, 'num');
				for (let i = 0; i < times.value; i++) {
					const v = await evalClause(runtime, node.for, scope, callStack);
					if (v.type === 'break') {
						if (v.label != null && v.label !== node.label) {
							return v;
						}
						break;
					} else if (v.type === 'continue') {
						if (v.label != null && v.label !== node.label) {
							return v;
						}
					} else if (v.type === 'return') {
						return v;
					}
				}
			} else {
				const from = await evalNode(runtime, node.from!, scope, callStack);
				if (isControl(from)) {
					return from;
				}
				const to = await evalNode(runtime, node.to!, scope, callStack);
				if (isControl(to)) {
					return to;
				}
				V.assert(from, 'num');
				V.assert(to, 'num');
				for (let i = from.value; i < from.value + to.value; i++) {
					const v = await evalNode(runtime, node.for, scope.createChildScope(new Map([
						[node.var!, {
							isMutable: false,
							value: NUM(i),
						}],
					])), callStack);
					if (v.type === 'break') {
						if (v.label != null && v.label !== node.label) {
							return v;
						}
						break;
					} else if (v.type === 'continue') {
						if (v.label != null && v.label !== node.label) {
							return v;
						}
					} else if (v.type === 'return') {
						return v;
					}
				}
			}
			return NULL;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			if (node.times) {
				const times = evalNodeSync(runtime, node.times, scope, callStack);
				if (isControl(times)) {
					return times;
				}
				V.assert(times, 'num');
				for (let i = 0; i < times.value; i++) {
					const v = evalClauseSync(runtime, node.for, scope, callStack);
					if (v.type === 'break') {
						if (v.label != null && v.label !== node.label) {
							return v;
						}
						break;
					} else if (v.type === 'continue') {
						if (v.label != null && v.label !== node.label) {
							return v;
						}
					} else if (v.type === 'return') {
						return v;
					}
				}
			} else {
				const from = evalNodeSync(runtime, node.from!, scope, callStack);
				if (isControl(from)) {
					return from;
				}
				const to = evalNodeSync(runtime, node.to!, scope, callStack);
				if (isControl(to)) {
					return to;
				}
				V.assert(from, 'num');
				V.assert(to, 'num');
				for (let i = from.value; i < from.value + to.value; i++) {
					const v = evalNodeSync(runtime, node.for, scope.createChildScope(new Map([
						[node.var!, {
							isMutable: false,
							value: NUM(i),
						}],
					])), callStack);
					if (v.type === 'break') {
						if (v.label != null && v.label !== node.label) {
							return v;
						}
						break;
					} else if (v.type === 'continue') {
						if (v.label != null && v.label !== node.label) {
							return v;
						}
					} else if (v.type === 'return') {
						return v;
					}
				}
			}
			return NULL;
		},
	},
	each: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const items = await evalNode(runtime, node.items, scope, callStack);
			if (isControl(items)) {
				return items;
			}
			V.assert(items, 'arr');
			for (const item of items.value) {
				const eachScope = scope.createChildScope();
				define(runtime, eachScope, node.var, item, false);
				const v = await evalNode(runtime, node.for, eachScope, callStack);
				if (v.type === 'break') {
					if (v.label != null && v.label !== node.label) {
						return v;
					}
					break;
				} else if (v.type === 'continue') {
					if (v.label != null && v.label !== node.label) {
						return v;
					}
				} else if (v.type === 'return') {
					return v;
				}
			}
			return NULL;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const items = evalNodeSync(runtime, node.items, scope, callStack);
			if (isControl(items)) {
				return items;
			}
			V.assert(items, 'arr');
			for (const item of items.value) {
				const eachScope = scope.createChildScope();
				define(runtime, eachScope, node.var, item, false);
				const v = evalNodeSync(runtime, node.for, eachScope, callStack);
				if (v.type === 'break') {
					if (v.label != null && v.label !== node.label) {
						return v;
					}
					break;
				} else if (v.type === 'continue') {
					if (v.label != null && v.label !== node.label) {
						return v;
					}
				} else if (v.type === 'return') {
					return v;
				}
			}
			return NULL;
		},
	},
} satisfies PartialEvaluatorRecord;
