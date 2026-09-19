export type SyncImplementation<Args extends unknown[], Result> = (...args: Args) => Result;

export type AsyncImplementation<Args extends unknown[], Result> = (...args: Args) => Result | Promise<Result>;

export type FunctionImplementation<
	SyncArgs extends unknown[],
	SyncResult,
	AsyncArgs extends unknown[] = SyncArgs,
	AsyncResult = SyncResult,
> =
	| SyncImplementation<SyncArgs, SyncResult>
	| {
		async: AsyncImplementation<AsyncArgs, AsyncResult>;
		sync?: SyncImplementation<SyncArgs, SyncResult>;
	};

export function callAsync<Args extends unknown[], Result>(
	implementation: FunctionImplementation<Args, Result>,
	...args: Args
): Result | Promise<Result> {
	return typeof implementation === 'function'
		? implementation(...args)
		: implementation.async(...args);
}

export function callSync<Args extends unknown[], Result>(
	implementation: FunctionImplementation<Args, Result>,
	onMissingSync: () => never,
	...args: Args
): Result {
	if (typeof implementation === 'function') {
		return implementation(...args);
	}
	if (implementation.sync == null) {
		return onMissingSync();
	}
	return implementation.sync(...args);
}
