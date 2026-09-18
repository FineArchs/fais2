import { isControl, type Control } from '../control.js';
import { assertArray, assertNumber } from '../util.js';
import { NULL, NUM, type Value } from '../value.js';
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
		case 'loop': {
			while (true) {
				const v = await context.run(node.statements, scope.createChildScope(), callStack);
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
				const times = await context.eval(node.times, scope, callStack);
				if (isControl(times)) {
					return times;
				}
				assertNumber(times);
				for (let i = 0; i < times.value; i++) {
					const v = await context.evalClause(node.for, scope, callStack);
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
				const from = await context.eval(node.from!, scope, callStack);
				if (isControl(from)) {
					return from;
				}
				const to = await context.eval(node.to!, scope, callStack);
				if (isControl(to)) {
					return to;
				}
				assertNumber(from);
				assertNumber(to);
				for (let i = from.value; i < from.value + to.value; i++) {
					const v = await context.eval(node.for, scope.createChildScope(new Map([
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
			const items = await context.eval(node.items, scope, callStack);
			if (isControl(items)) {
				return items;
			}
			assertArray(items);
			for (const item of items.value) {
				const eachScope = scope.createChildScope();
				context.define(eachScope, node.var, item, false);
				const v = await context.eval(node.for, eachScope, callStack);
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
	context: EvalContext,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Value | Control {
	switch (node.type) {
		case 'loop': {
			while (true) {
				const v = context.runSync(node.statements, scope.createChildScope(), callStack);
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
				const times = context.evalSync(node.times, scope, callStack);
				if (isControl(times)) {
					return times;
				}
				assertNumber(times);
				for (let i = 0; i < times.value; i++) {
					const v = context.evalClauseSync(node.for, scope, callStack);
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
				const from = context.evalSync(node.from!, scope, callStack);
				if (isControl(from)) {
					return from;
				}
				const to = context.evalSync(node.to!, scope, callStack);
				if (isControl(to)) {
					return to;
				}
				assertNumber(from);
				assertNumber(to);
				for (let i = from.value; i < from.value + to.value; i++) {
					const v = context.evalSync(node.for, scope.createChildScope(new Map([
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
			const items = context.evalSync(node.items, scope, callStack);
			if (isControl(items)) {
				return items;
			}
			assertArray(items);
			for (const item of items.value) {
				const eachScope = scope.createChildScope();
				context.define(eachScope, node.var, item, false);
				const v = context.evalSync(node.for, eachScope, callStack);
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
