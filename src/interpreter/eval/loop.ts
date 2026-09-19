import { isControl, type Control } from '../control.js';
import { assertArray, assertNumber } from '../util.js';
import { NULL, NUM, type Value } from '../value.js';
import { evalNode, evalNodeSync, evalClause, evalClauseSync, run, runSync, define } from './operations.js';
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
		case 'loop': {
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
		}

		case 'for': {
			if (node.times) {
				const times = await evalNode(runtime, node.times, scope, callStack);
				if (isControl(times)) {
					return times;
				}
				assertNumber(times);
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
				assertNumber(from);
				assertNumber(to);
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
		}

		case 'each': {
			const items = await evalNode(runtime, node.items, scope, callStack);
			if (isControl(items)) {
				return items;
			}
			assertArray(items);
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
		case 'loop': {
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
		}

		case 'for': {
			if (node.times) {
				const times = evalNodeSync(runtime, node.times, scope, callStack);
				if (isControl(times)) {
					return times;
				}
				assertNumber(times);
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
				assertNumber(from);
				assertNumber(to);
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
		}

		case 'each': {
			const items = evalNodeSync(runtime, node.items, scope, callStack);
			if (isControl(items)) {
				return items;
			}
			assertArray(items);
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
		}

		default: throw new Error('invalid node type');
	}
}
