import type * as Ast from '../../node.js';
import type { FunctionImplementation } from '../../utils/function-implementation.js';
import type { Control } from '../control.js';
import type { Scope } from '../scope.js';
import type { Value } from '../value.js';
import type { CallInfo, EvalRuntime } from './runtime.js';

export type Evaluator<Type extends Ast.Node['type'] = Ast.Node['type']> = FunctionImplementation<[
	runtime: EvalRuntime,
	node: Extract<Ast.Node, { type: Type }>,
	scope: Scope,
	callStack: readonly CallInfo[],
], Value | Control>;

export type EvaluatorRecord = {
	[Type in Ast.Node['type']]: Evaluator<Type>;
};

export type PartialEvaluatorRecord = Partial<EvaluatorRecord>;
