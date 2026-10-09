/**
 * Components read `useDirection().direction`. Computed style direction is not a source.
 * Aliases are matched by bare name.
 *
 * Still open: `const { direction } = getComputedStyle(el)`, `['direction']`,
 * and ``getPropertyValue(`direction`)``.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

/**
 * @param {unknown} node
 */
function isGetComputedStyle(node) {
	const value = unwrap(node);
	if (!value || value.type !== 'CallExpression') return false;
	const callee = unwrap(value.callee);
	if (!callee) return false;
	if (nameOf(callee) === 'getComputedStyle') return true;
	return callee.type === 'MemberExpression' && nameOf(callee.property) === 'getComputedStyle';
}

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow getComputedStyle(...).direction. Read useDirection().direction.'
		},
		schema: [],
		messages: {
			computedDirection:
				'Do not read `getComputedStyle(...).direction`. Call `useDirection()` during component init and read `.direction`.'
		}
	},
	create(context) {
		const filename = context.filename.replaceAll('\\', '/');
		if (filename.includes('.spec.')) return {};

		/** @type {Set<string>} */
		const stored = new Set();

		/**
		 * @param {unknown} id
		 * @param {unknown} init
		 */
		function remember(id, init) {
			if (!id || id.type !== 'Identifier' || !isGetComputedStyle(init)) return;
			stored.add(id.name);
		}

		return {
			VariableDeclarator(node) {
				remember(node.id, node.init);
			},
			AssignmentExpression(node) {
				if (node.operator !== '=') return;
				remember(node.left, node.right);
			},
			MemberExpression(node) {
				if (node.computed) return;
				if (nameOf(node.property) !== 'direction') return;
				const object = unwrap(node.object);
				if (!object) return;
				if (
					isGetComputedStyle(object) ||
					(object.type === 'Identifier' && stored.has(object.name))
				) {
					context.report({ node, messageId: 'computedDirection' });
				}
			},
			CallExpression(node) {
				const callee = unwrap(node.callee);
				if (!callee || callee.type !== 'MemberExpression' || callee.computed) return;
				if (nameOf(callee.property) !== 'getPropertyValue') return;
				const argument = unwrap(node.arguments?.[0]);
				if (!argument || argument.type !== 'Literal' || argument.value !== 'direction') return;
				const object = unwrap(callee.object);
				if (!object) return;
				if (
					isGetComputedStyle(object) ||
					(object.type === 'Identifier' && stored.has(object.name))
				) {
					context.report({ node, messageId: 'computedDirection' });
				}
			}
		};
	}
};

export default rule;
