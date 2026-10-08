/**
 * Arrow, Home, and End belong to `COMPOSITE_KEYS`. An inline array that
 * repeats those six keys is a second copy of the composite set.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { unwrap } from './effects.js';

const COMPOSITE = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow an inline array of Arrow, Home, and End keys.'
		},
		schema: [],
		messages: {
			inline:
				'Do not inline Arrow, Home, and End. Import `COMPOSITE_KEYS` from `src/lib/internal/composite-keys.ts`.'
		}
	},
	create(context) {
		const filename = context.filename ?? context.getFilename();
		if (filename.endsWith('src/lib/internal/composite-keys.ts')) return {};

		return {
			ArrayExpression(node) {
				if (!includesCompositeKeys(node)) return;
				context.report({ node, messageId: 'inline' });
			}
		};
	}
};

/**
 * @param {unknown} node
 */
function includesCompositeKeys(node) {
	const array = unwrap(node);
	if (!array || array.type !== 'ArrayExpression') return false;
	/** @type {Set<string>} */
	const values = new Set();
	for (const element of array.elements ?? []) {
		const item = unwrap(element);
		if (!item || item.type !== 'Literal' || typeof item.value !== 'string') continue;
		values.add(item.value);
	}
	return COMPOSITE.every((key) => values.has(key));
}

export default rule;
