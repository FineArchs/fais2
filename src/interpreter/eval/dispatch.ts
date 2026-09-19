import { AiScriptRuntimeError } from '../../error.js';
import { callAsync, callSync } from '../../utils/function-implementation.js';
import { libEvalBinding } from './binding.js';
import { libEvalCallFunction } from './call-function.js';
import { libEvalCollection } from './collection.js';
import { libEvalCondition } from './condition.js';
import { libEvalControlFlow } from './control-flow.js';
import { libEvalInvalid } from './invalid.js';
import { libEvalLiteral } from './literal.js';
import { libEvalLoop } from './loop.js';
import { libEvalOperator } from './operator.js';
import type * as Ast from '../../node.js';
import type { Control } from '../control.js';
import type { Scope } from '../scope.js';
import type { Value } from '../value.js';
import type { Evaluator, EvaluatorRecord } from './evaluator.js';
import type { CallInfo, EvalRuntime } from './runtime.js';

const evaluators = {
	...libEvalBinding,
	...libEvalCallFunction,
	...libEvalCollection,
	...libEvalCondition,
	...libEvalControlFlow,
	...libEvalInvalid,
	...libEvalLiteral,
	...libEvalLoop,
	...libEvalOperator,
} satisfies EvaluatorRecord;

export function dispatch(
	runtime: EvalRuntime,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Promise<Value | Control> {
	const evaluator = evaluators[node.type] as unknown as Evaluator;
	return Promise.resolve(callAsync(evaluator, runtime, node, scope, callStack));
}

export function dispatchSync(
	runtime: EvalRuntime,
	node: Ast.Node,
	scope: Scope,
	callStack: readonly CallInfo[],
): Value | Control {
	const evaluator = evaluators[node.type] as unknown as Evaluator;
	return callSync(
		evaluator,
		() => { throw new AiScriptRuntimeError('The evaluator does not support sync mode.'); },
		runtime,
		node,
		scope,
		callStack,
	);
}
