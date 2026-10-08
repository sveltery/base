/**
 * Arrow, Home, and End belong to `COMPOSITE_KEYS` / `ARROW_KEYS`.
 * An inline set of four or more of those six keys is a second copy.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

const COMPOSITE = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];
const COMPOSITE_SET = new Set(COMPOSITE);
const MIN_KEYS = 4;

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow an inline set of four or more Arrow, Home, and End keys.'
		},
		schema: [],
		messages: {
			inline:
				'Do not inline Arrow, Home, and End. Import `COMPOSITE_KEYS` or `ARROW_KEYS` from `src/lib/internal/composite-keys.ts`.'
		}
	},
	create(context) {
		const filename = context.filename ?? context.getFilename();
		if (filename.endsWith('src/lib/internal/composite-keys.ts')) return {};

		return {
			ArrayExpression(node) {
				report(context, node, keysIn(node));
			},
			ObjectExpression(node) {
				report(context, node, keysIn(node));
			},
			LogicalExpression(node) {
				if (node.operator !== '||') return;
				const parent = unwrap(node.parent);
				if (parent?.type === 'LogicalExpression' && parent.operator === '||') return;
				report(context, node, orKeys(node));
			},
			SwitchStatement(node) {
				/** @type {Set<string>} */
				const values = new Set();
				for (const item of node.cases ?? []) addKey(values, stringValue(item.test));
				report(context, node, values);
			},
			Literal(node) {
				if (!node.regex?.pattern) return;
				report(context, node, regexKeys(node.regex.pattern));
			},
			NewExpression(node) {
				if (nameOf(node.callee) !== 'RegExp' || node.arguments?.length < 1) return;
				const pattern = stringValue(node.arguments[0]);
				if (pattern == null) return;
				report(context, node, regexKeys(pattern));
			},
			CallExpression(node) {
				if (!isCompositeSplit(node)) return;
				report(context, node, splitKeys(node));
			}
		};
	}
};

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {unknown} node
 * @param {Set<string>} values
 */
function report(context, node, values) {
	if (values.size >= MIN_KEYS) context.report({ node, messageId: 'inline' });
}

/**
 * @param {Set<string>} values
 * @param {string | undefined} text
 */
function addKey(values, text) {
	if (text != null && COMPOSITE_SET.has(text)) values.add(text);
}

/**
 * Keys named by an array, including nested spreads, or by an object's keys.
 * @param {unknown} node
 */
function keysIn(node) {
	/** @type {Set<string>} */
	const values = new Set();
	collect(node, values);
	return values;
}

/**
 * @param {unknown} node
 * @param {Set<string>} values
 */
function collect(node, values) {
	const item = unwrap(node);
	if (!item) return;
	addKey(values, stringValue(item));
	if (item.type === 'ArrayExpression') {
		for (const element of item.elements ?? []) {
			if (!element) continue;
			if (element.type === 'SpreadElement') collect(element.argument, values);
			else collect(element, values);
		}
	}
	if (item.type === 'ObjectExpression') {
		for (const prop of item.properties ?? []) {
			if (!prop || prop.type !== 'Property') continue;
			if (prop.computed) collect(prop.key, values);
			else addKey(values, stringValue(prop.key) ?? nameOf(prop.key) ?? undefined);
		}
	}
}

/**
 * `key === 'ArrowDown' || key === 'ArrowUp' || …`
 * @param {unknown} node
 */
function orKeys(node) {
	/** @type {Set<string>} */
	const values = new Set();
	flattenOr(node, values);
	return values;
}

/**
 * @param {unknown} node
 * @param {Set<string>} values
 */
function flattenOr(node, values) {
	const item = unwrap(node);
	if (!item) return;
	if (item.type === 'LogicalExpression' && item.operator === '||') {
		flattenOr(item.left, values);
		flattenOr(item.right, values);
		return;
	}
	if (item.type === 'BinaryExpression' && (item.operator === '===' || item.operator === '==')) {
		addKey(values, stringValue(item.left));
		addKey(values, stringValue(item.right));
	}
}

/**
 * @param {string} pattern
 */
function regexKeys(pattern) {
	/** @type {Set<string>} */
	const values = new Set();
	for (const key of COMPOSITE) {
		if (new RegExp(`(?:^|[^A-Za-z])${key}(?:[^A-Za-z]|$)`).test(pattern)) values.add(key);
	}
	return values;
}

/**
 * `'ArrowDown ArrowUp …'.split(' ')` and the same list split on a comma.
 * @param {unknown} node
 */
function isCompositeSplit(node) {
	return splitKeys(node).size >= MIN_KEYS;
}

/**
 * @param {unknown} node
 */
function splitKeys(node) {
	/** @type {Set<string>} */
	const values = new Set();
	const call = unwrap(node);
	if (!call || call.type !== 'CallExpression' || call.arguments?.length !== 1) return values;
	const callee = unwrap(call.callee);
	if (!callee || callee.type !== 'MemberExpression' || callee.computed) return values;
	if (nameOf(callee.property) !== 'split') return values;
	const separator = stringValue(call.arguments[0]);
	if (separator !== ' ' && separator !== ',') return values;
	const text = stringValue(callee.object);
	if (text == null) return values;
	for (const part of text.split(separator)) addKey(values, part);
	return values;
}

/**
 * A string literal, a template with no substitutions, or `'Arrow' + 'Up'`.
 * @param {unknown} node
 */
function stringValue(node) {
	const item = unwrap(node);
	if (!item) return undefined;
	if (item.type === 'Literal' && typeof item.value === 'string') return item.value;
	if (item.type === 'TemplateLiteral' && item.expressions?.length === 0) {
		return item.quasis?.[0]?.value?.cooked ?? '';
	}
	if (item.type === 'BinaryExpression' && item.operator === '+') {
		const left = stringValue(item.left);
		const right = stringValue(item.right);
		if (left != null && right != null) return left + right;
	}
	return undefined;
}

export default rule;
