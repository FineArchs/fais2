import type { PartialEvaluatorRecord } from './evaluator.js';

const invalid = () => { throw new Error('invalid node type'); };

export const libEvalInvalid = {
	namedTypeSource: invalid,
	fnTypeSource: invalid,
	unionTypeSource: invalid,
	attr: invalid,
} satisfies PartialEvaluatorRecord;
