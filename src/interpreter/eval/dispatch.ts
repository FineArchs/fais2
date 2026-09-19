import { mustBeNever } from '../../utils/mustbenever.js';
import { evaluate as evaluateBinding, evaluateSync as evaluateBindingSync } from './binding.js';
import { evaluate as evaluateCallFunction, evaluateSync as evaluateCallFunctionSync } from './call-function.js';
import { evaluate as evaluateCollection, evaluateSync as evaluateCollectionSync } from './collection.js';
import { evaluate as evaluateCondition, evaluateSync as evaluateConditionSync } from './condition.js';
import { evaluate as evaluateControlFlow, evaluateSync as evaluateControlFlowSync } from './control-flow.js';
import { evaluate as evaluateInvalid, evaluateSync as evaluateInvalidSync } from './invalid.js';
import { evaluate as evaluateLiteral, evaluateSync as evaluateLiteralSync } from './literal.js';
import { evaluate as evaluateLoop, evaluateSync as evaluateLoopSync } from './loop.js';
import { evaluate as evaluateOperator, evaluateSync as evaluateOperatorSync } from './operator.js';
import type { Value } from '../value.js';
import type { Scope } from '../scope.js';
import type * as Ast from '../../node.js';
import type { Control } from '../control.js';
import type { CallInfo, EvalRuntime } from './runtime.js';

export async function dispatch(
	runtime: EvalRuntime,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Promise<Value | Control> {
	switch (node.type) {
		case 'call':
		case 'fn':
			return evaluateCallFunction(runtime, node, scope, callStack);
		case 'if':
		case 'match':
			return evaluateCondition(runtime, node, scope, callStack);
		case 'loop':
		case 'for':
		case 'each':
			return evaluateLoop(runtime, node, scope, callStack);
		case 'def':
		case 'identifier':
		case 'assign':
		case 'addAssign':
		case 'subAssign':
		case 'exists':
			return evaluateBinding(runtime, node, scope, callStack);
		case 'arr':
		case 'obj':
		case 'prop':
		case 'index':
		case 'tmpl':
			return evaluateCollection(runtime, node, scope, callStack);
		case 'plus':
		case 'minus':
		case 'not':
		case 'pow':
		case 'mul':
		case 'div':
		case 'rem':
		case 'add':
		case 'sub':
		case 'lt':
		case 'lteq':
		case 'gt':
		case 'gteq':
		case 'eq':
		case 'neq':
		case 'and':
		case 'or':
			return evaluateOperator(runtime, node, scope, callStack);
		case 'block':
		case 'return':
		case 'break':
		case 'continue':
			return evaluateControlFlow(runtime, node, scope, callStack);
		case 'null':
		case 'bool':
		case 'num':
		case 'str':
		case 'ns':
		case 'meta':
			return evaluateLiteral(runtime, node, scope, callStack);
		case 'namedTypeSource':
		case 'fnTypeSource':
		case 'unionTypeSource':
		case 'attr':
			return evaluateInvalid(runtime, node, scope, callStack);
		default:
			return mustBeNever(node, () => 'invalid node type');
	}
}

export function dispatchSync(
	runtime: EvalRuntime,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Value | Control {
	switch (node.type) {
		case 'call':
		case 'fn':
			return evaluateCallFunctionSync(runtime, node, scope, callStack);
		case 'if':
		case 'match':
			return evaluateConditionSync(runtime, node, scope, callStack);
		case 'loop':
		case 'for':
		case 'each':
			return evaluateLoopSync(runtime, node, scope, callStack);
		case 'def':
		case 'identifier':
		case 'assign':
		case 'addAssign':
		case 'subAssign':
		case 'exists':
			return evaluateBindingSync(runtime, node, scope, callStack);
		case 'arr':
		case 'obj':
		case 'prop':
		case 'index':
		case 'tmpl':
			return evaluateCollectionSync(runtime, node, scope, callStack);
		case 'plus':
		case 'minus':
		case 'not':
		case 'pow':
		case 'mul':
		case 'div':
		case 'rem':
		case 'add':
		case 'sub':
		case 'lt':
		case 'lteq':
		case 'gt':
		case 'gteq':
		case 'eq':
		case 'neq':
		case 'and':
		case 'or':
			return evaluateOperatorSync(runtime, node, scope, callStack);
		case 'block':
		case 'return':
		case 'break':
		case 'continue':
			return evaluateControlFlowSync(runtime, node, scope, callStack);
		case 'null':
		case 'bool':
		case 'num':
		case 'str':
		case 'ns':
		case 'meta':
			return evaluateLiteralSync(runtime, node, scope, callStack);
		case 'namedTypeSource':
		case 'fnTypeSource':
		case 'unionTypeSource':
		case 'attr':
			return evaluateInvalidSync(runtime, node, scope, callStack);
		default:
			return mustBeNever(node, () => 'invalid node type');
	}
}
