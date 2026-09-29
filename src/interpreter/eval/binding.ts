import { isControl, type Control } from '../control.js';
import { ValueTypeUtil as V } from '../util.js';
import { BOOL, NULL, NUM, type Value } from '../value.js';
import { evalNode, evalNodeSync, define, getReference, getReferenceSync, setAttributes, setAttributesSync } from './operations.js';
import type { PartialEvaluatorRecord } from './evaluator.js';

export const libEvalBinding = {
	def: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const value = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(value)) {
				return value;
			}
			await setAttributes(runtime, node.attr, value, scope, callStack);
			if (
				node.expr.type === 'fn'
		&& node.dest.type === 'identifier'
		&& V.is(value, 'fn')
		&& !value.native
			) {
				value.name = node.dest.name;
			}
			define(runtime, scope, node.dest, value, node.mut);
			return NULL;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const value = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(value)) {
				return value;
			}
			setAttributesSync(runtime, node.attr, value, scope, callStack);
			if (
				node.expr.type === 'fn'
		&& node.dest.type === 'identifier'
		&& V.is(value, 'fn')
		&& !value.native
			) {
				value.name = node.dest.name;
			}
			define(runtime, scope, node.dest, value, node.mut);
			return NULL;
		},
	},
	identifier: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return scope.get(node.name);
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return scope.get(node.name);
		},
	},
	assign: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const target = await getReference(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
		
			target.set(v);
		
			return NULL;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const target = getReferenceSync(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
		
			target.set(v);
		
			return NULL;
		},
	},
	addAssign: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const target = await getReference(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'num');
			const targetValue = target.get();
			V.assert(targetValue, 'num');
		
			target.set(NUM(targetValue.value + v.value));
			return NULL;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const target = getReferenceSync(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'num');
			const targetValue = target.get();
			V.assert(targetValue, 'num');
		
			target.set(NUM(targetValue.value + v.value));
			return NULL;
		},
	},
	subAssign: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			const target = await getReference(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = await evalNode(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'num');
			const targetValue = target.get();
			V.assert(targetValue, 'num');
		
			target.set(NUM(targetValue.value - v.value));
			return NULL;
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			const target = getReferenceSync(runtime, node.dest, scope, callStack);
			if (isControl(target)) {
				return target;
			}
			const v = evalNodeSync(runtime, node.expr, scope, callStack);
			if (isControl(v)) {
				return v;
			}
			V.assert(v, 'num');
			const targetValue = target.get();
			V.assert(targetValue, 'num');
		
			target.set(NUM(targetValue.value - v.value));
			return NULL;
		},
	},
	exists: {
		async: async (
			runtime,
			node,
			scope,
			callStack,
		): Promise<Value | Control> => {
			return BOOL(scope.exists(node.identifier.name));
		},
		sync: (
			runtime,
			node,
			scope,
			callStack,
		): Value | Control => {
			return BOOL(scope.exists(node.identifier.name));
		},
	},
} satisfies PartialEvaluatorRecord;
