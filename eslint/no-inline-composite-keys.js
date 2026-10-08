/**
 * Arrow, Home, and End belong to `COMPOSITE_KEYS`. An inline array that
 * repeats those six keys is a second copy of the composite set.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

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
			},
			CallExpression(node) {
				if (!isCompositeSplit(node)) return;
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
		const value = stringValue(element);
		if (value != null) values.add(value);
	}
	return COMPOSITE.every((key) => values.has(key));
}

/**
 * `'ArrowDown ArrowUp ...'.split(' ')` and the same text in a template.
 * @param {unknown} node
 */
function isCompositeSplit(node) {
	const call = unwrap(node);
	if (!call || call.type !== 'CallExpression' || call.arguments?.length !== 1) return false;
	const callee = unwrap(call.callee);
	if (!callee || callee.type !== 'MemberExpression' || callee.computed) return false;
	if (nameOf(callee.property) !== 'split') return false;
	if (stringValue(call.arguments[0]) !== ' ') return false;
	const text = stringValue(callee.object);
	if (text == null) return false;
	const values = new Set(text.split(' '));
	return COMPOSITE.every((key) => values.has(key));
}

/**
 * A string literal, or a template with no substitutions.
 * @param {unknown} node
 */
function stringValue(node) {
	const item = unwrap(node);
	if (!item) return undefined;
	if (item.type === 'Literal' && typeof item.value === 'string') return item.value;
	if (item.type === 'TemplateLiteral' && item.expressions?.length === 0) {
		return item.quasis?.[0]?.value?.cooked ?? '';
	}
	return undefined;
}

export default rule;
