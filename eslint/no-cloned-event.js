/**
 * Reject cloned events and fake targets.
 * `new event.constructor(...)`, `new Alias(...)` when Alias was read from
 * `.constructor`, and `Object.defineProperty(event, 'target', ...)`.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

/**
 * @param {unknown} node
 * @returns {boolean}
 */
function isConstructorMember(node) {
	const value = unwrap(node);
	return Boolean(
		value && value.type === 'MemberExpression' && nameOf(value.property) === 'constructor'
	);
}

/**
 * @param {unknown} node
 * @param {Set<string>} aliases
 * @returns {boolean}
 */
function isConstructorClone(node, aliases) {
	const value = unwrap(node);
	if (!value || value.type !== 'NewExpression') return false;
	const callee = unwrap(value.callee);
	if (!callee) return false;
	if (callee.type === 'MemberExpression' && nameOf(callee.property) === 'constructor') return true;
	return callee.type === 'Identifier' && aliases.has(callee.name);
}

/**
 * @param {unknown} node
 * @returns {boolean}
 */
function redefinesTarget(node) {
	const value = unwrap(node);
	if (!value || value.type !== 'CallExpression') return false;
	const callee = unwrap(value.callee);
	if (!callee || callee.type !== 'MemberExpression') return false;
	if (nameOf(callee.object) !== 'Object' || nameOf(callee.property) !== 'defineProperty')
		return false;
	const property = unwrap(value.arguments?.[1]);
	return Boolean(property && property.type === 'Literal' && property.value === 'target');
}

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow cloning an event or replacing its target.'
		},
		schema: [],
		messages: {
			clonedEvent:
				'Do not clone an event with `new event.constructor(...)` or replace `event.target`. Pass the original event. The next value belongs on the callback argument.'
		}
	},
	create(context) {
		/** @type {Set<string>} */
		const aliases = new Set();

		/**
		 * @param {unknown} id
		 * @param {unknown} init
		 */
		function remember(id, init) {
			if (!id || typeof id !== 'object' || !('type' in id) || id.type !== 'Identifier') return;
			if (!isConstructorMember(init)) return;
			if (typeof id.name === 'string') aliases.add(id.name);
		}

		return {
			VariableDeclarator(node) {
				remember(node.id, node.init);
			},
			AssignmentExpression(node) {
				if (node.operator !== '=') return;
				remember(node.left, node.right);
			},
			NewExpression(node) {
				if (isConstructorClone(node, aliases)) context.report({ node, messageId: 'clonedEvent' });
			},
			CallExpression(node) {
				if (redefinesTarget(node)) context.report({ node, messageId: 'clonedEvent' });
			}
		};
	}
};

export default rule;
