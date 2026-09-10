// exhaustiveness checker function
export function mustBeNever<TExcept = never>(value: NoInfer<TExcept>, createError: (v: NoInfer<TExcept>) => string | Error): never {
	const error = createError(value);
	throw typeof error === 'string' ? new Error(error) : error;
}

// https://stackoverflow.com/questions/56687668/a-way-to-disable-type-argument-inference-in-generics
type NoInfer<T> = [T][T extends unknown ? 0 : never];
