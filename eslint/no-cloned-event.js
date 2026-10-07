/**
 * Reject cloned events and fake targets.
 * `new event.constructor(...)` and `Object.defineProperty(event, 'target', ...)`.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

/**
 * @param {unknown} node
 * @returns {boolean}
 */
function isConstructorClone(node) {
	const value = unwrap(node);
	if (!value || value.type !== 'NewExpression') return false;
	const callee = unwrap(value.callee);
	return Boolean(
		callee && callee.type === 'MemberExpression' && nameOf(callee.property) === 'constructor'
	);
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
		return {
			NewExpression(node) {
				if (isConstructorClone(node)) context.report({ node, messageId: 'clonedEvent' });
			},
			CallExpression(node) {
				if (redefinesTarget(node)) context.report({ node, messageId: 'clonedEvent' });
			}
		};
	}
};

export default rule;
