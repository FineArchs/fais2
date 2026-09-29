import { NUM, FN_NATIVE, NULL } from '../value.js';
import { ValueTypeUtil as V } from '../util.js';
import { AiScriptRuntimeError } from '../../error.js';
import { CryptoGen } from '../../utils/random/CryptoGen.js';
import { GenerateChaCha20Random, GenerateLegacyRandom, GenerateRC4Random } from '../../utils/random/genrng.js';
import type { Value, VNum, VObj, VStr } from '../value.js';

function parseParams(
	seed: Value | undefined,
	options: Value | undefined,
): {
	seed: VNum | VStr;
	options: VObj | undefined;
	algo: string;
} {
	V.assert(seed, ['num', 'str']);
	const isSecureContext = 'subtle' in crypto;
	let algo = isSecureContext ? 'chacha20' : 'rc4_legacy';
	if (options && V.is(options, 'obj')) {
		const v = V.mustBe(options.value.get('algorithm'), 'str');
		algo = v.value;
	} else if (options !== undefined) {
		throw new AiScriptRuntimeError('`options` must be an object if specified.');
	}
	if (!isSecureContext && algo === 'chacha20') throw new AiScriptRuntimeError('chacha20 cannot be used because `crypto.subtle` is not available. Maybe in non-secure context?');
	return { seed, options, algo };
}

export const stdMathRnd: Record<`Math:${string}`, Value> = {
	'Math:rnd': FN_NATIVE(([min, max]) => {
		if (min && V.is(min, 'num') && max && V.is(max, 'num')) {
			const res = CryptoGen.instance.generateRandomIntegerInRange(min.value, max.value);
			return res === null ? NULL : NUM(res);
		}
		return NUM(CryptoGen.instance.generateNumber0To1());
	}),

	'Math:gen_rng': FN_NATIVE({
		async: async ([seedArg, optionsArg]) => {
			const { seed, options, algo } = parseParams(seedArg, optionsArg);
			switch (algo) {
				case 'rc4_legacy':
					return GenerateLegacyRandom(seed);
				case 'rc4': {
					return GenerateRC4Random(seed);
				}
				case 'chacha20': {
					return await GenerateChaCha20Random(seed, options?.value);
				}
				default:
					throw new AiScriptRuntimeError('`options.algorithm` must be one of these: `chacha20`, `rc4`, or `rc4_legacy`.');
			}
		},
		sync: ([seedArg, optionsArg]) => {
			const { seed, algo } = parseParams(seedArg, optionsArg);
			switch (algo) {
				case 'rc4_legacy':
					return GenerateLegacyRandom(seed);
				case 'rc4': {
					return GenerateRC4Random(seed);
				}
				case 'chacha20':
					throw new AiScriptRuntimeError('chacha20 cannot be used in sync mode.');
				default:
					throw new AiScriptRuntimeError('`options.algorithm` must be one of these: `chacha20`, `rc4`, or `rc4_legacy`.');
			}
		},
	}),
};
