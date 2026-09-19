import { BOOL, NULL, NUM, STR } from '../value.js';
import type { PartialEvaluatorRecord } from './evaluator.js';

export const libEvalLiteral = {
	null: () => NULL,
	bool: (_runtime, node) => BOOL(node.value),
	num: (_runtime, node) => NUM(node.value),
	str: (_runtime, node) => STR(node.value),
	ns: () => NULL,
	meta: () => NULL,
} satisfies PartialEvaluatorRecord;
