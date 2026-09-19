import type * as Ast from '../../node.js';
import type { Value, VFn } from '../value.js';
import type { Variable } from '../variable.js';

export type CallInfo = {
	name: string;
	pos: Ast.Pos | undefined;
};

export type RuntimeLogObject = {
	scope?: string;
	var?: string;
	val?: Value | Variable;
};

export interface EvalRuntime {
	stepCount: number;
	stop: boolean;
	pausing: { promise: Promise<void>; resolve: () => void } | null;
	irqRate: number;
	irqSleep(): Promise<void>;
	opts: {
		maxStep?: number;
		log?(type: string, params: RuntimeLogObject): void;
	};
	execFn(fn: VFn, args: Value[]): Promise<Value>;
	execFnSync(fn: VFn, args: Value[]): Value;
	registerAbortHandler(handler: () => void): void;
	registerPauseHandler(handler: () => void): void;
	registerUnpauseHandler(handler: () => void): void;
	unregisterAbortHandler(handler: () => void): void;
	unregisterPauseHandler(handler: () => void): void;
	unregisterUnpauseHandler(handler: () => void): void;
}
