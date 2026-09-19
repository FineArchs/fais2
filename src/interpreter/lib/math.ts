import { NUM, FN_NATIVE } from '../value.js';
import { assertNumber, assertArray } from '../util.js';
import { stdMathRnd } from './math-rnd.js';
import type { Value } from '../value.js';

export const stdMath: Record<`Math:${string}`, Value> = {
	...stdMathRnd,

	'Math:Infinity': NUM(Infinity),

	'Math:E': NUM(Math.E),
	'Math:LN2': NUM(Math.LN2),
	'Math:LN10': NUM(Math.LN10),
	'Math:LOG2E': NUM(Math.LOG2E),
	'Math:LOG10E': NUM(Math.LOG10E),
	'Math:PI': NUM(Math.PI),
	'Math:SQRT1_2': NUM(Math.SQRT1_2),
	'Math:SQRT2': NUM(Math.SQRT2),

	'Math:abs': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.abs(v.value));
	}),

	'Math:acos': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.acos(v.value));
	}),

	'Math:acosh': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.acosh(v.value));
	}),

	'Math:asin': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.asin(v.value));
	}),

	'Math:asinh': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.asinh(v.value));
	}),

	'Math:atan': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.atan(v.value));
	}),

	'Math:atanh': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.atanh(v.value));
	}),

	'Math:atan2': FN_NATIVE(([y, x]) => {
		assertNumber(y);
		assertNumber(x);
		return NUM(Math.atan2(y.value, x.value));
	}),

	'Math:cbrt': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.cbrt(v.value));
	}),

	'Math:ceil': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.ceil(v.value));
	}),

	'Math:clz32': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.clz32(v.value));
	}),

	'Math:cos': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.cos(v.value));
	}),

	'Math:cosh': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.cosh(v.value));
	}),

	'Math:exp': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.exp(v.value));
	}),

	'Math:expm1': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.expm1(v.value));
	}),

	'Math:floor': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.floor(v.value));
	}),

	'Math:fround': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.fround(v.value));
	}),

	'Math:hypot': FN_NATIVE(([vs]) => {
		assertArray(vs);
		const values = [];
		for (const v of vs.value) {
			assertNumber(v);
			values.push(v.value);
		}
		return NUM(Math.hypot(...values));
	}),

	'Math:imul': FN_NATIVE(([x, y]) => {
		assertNumber(x);
		assertNumber(y);
		return NUM(Math.imul(x.value, y.value));
	}),

	'Math:log': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.log(v.value));
	}),

	'Math:log1p': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.log1p(v.value));
	}),

	'Math:log10': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.log10(v.value));
	}),

	'Math:log2': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.log2(v.value));
	}),

	'Math:max': FN_NATIVE(([a, b]) => {
		assertNumber(a);
		assertNumber(b);
		return NUM(Math.max(a.value, b.value));
	}),

	'Math:min': FN_NATIVE(([a, b]) => {
		assertNumber(a);
		assertNumber(b);
		return NUM(Math.min(a.value, b.value));
	}),

	'Math:pow': FN_NATIVE(([x, y]) => {
		assertNumber(x);
		assertNumber(y);
		return NUM(Math.pow(x.value, y.value));
	}),

	'Math:round': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.round(v.value));
	}),

	'Math:sign': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.sign(v.value));
	}),

	'Math:sin': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.sin(v.value));
	}),

	'Math:sinh': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.sinh(v.value));
	}),

	'Math:sqrt': FN_NATIVE(([v]) => {
		assertNumber(v);
		const res = Math.sqrt(v.value);
		return NUM(res);
	}),

	'Math:tan': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.tan(v.value));
	}),

	'Math:tanh': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.tanh(v.value));
	}),

	'Math:trunc': FN_NATIVE(([v]) => {
		assertNumber(v);
		return NUM(Math.trunc(v.value));
	}),
};
