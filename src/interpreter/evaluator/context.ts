import type * as Ast from '../../node.js';
import type { Control } from '../control.js';
import type { Reference } from '../reference.js';
import type { Scope } from '../scope.js';
import type { Value, VFn } from '../value.js';

export type CallInfo = {
	name: string;
	pos: Ast.Pos | undefined;
};

export interface EvalContext {
	eval(node: Ast.Node, scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control>;
	evalSync(node: Ast.Node, scope: Scope, callStack: readonly CallInfo[]): Value | Control;
	evalClause(node: Ast.Statement | Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control>;
	evalClauseSync(node: Ast.Statement | Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Value | Control;
	evalBinaryOperation(op: string, left: Ast.Expression, right: Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control>;
	evalBinaryOperationSync(op: string, left: Ast.Expression, right: Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Value | Control;
	run(nodes: Ast.Node[], scope: Scope, callStack: readonly CallInfo[]): Promise<Value | Control>;
	runSync(nodes: Ast.Node[], scope: Scope, callStack: readonly CallInfo[]): Value | Control;
	call(fn: VFn, args: Value[], callStack: readonly CallInfo[], pos?: Ast.Pos): Promise<Value>;
	callSync(fn: VFn, args: Value[], callStack: readonly CallInfo[], pos?: Ast.Pos): Value;
	define(scope: Scope, dest: Ast.Expression, value: Value, mutable: boolean): void;
	getReference(dest: Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Promise<Reference | Control>;
	getReferenceSync(dest: Ast.Expression, scope: Scope, callStack: readonly CallInfo[]): Reference | Control;
	setAttributes(attr: Ast.Attribute[], value: Value, scope: Scope, callStack: readonly CallInfo[]): Promise<void>;
	setAttributesSync(attr: Ast.Attribute[], value: Value, scope: Scope, callStack: readonly CallInfo[]): void;
	log(type: string, params: { scope?: string; val?: Value }): void;
}
