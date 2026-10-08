/**
 * Components read `useDirection().direction`. Computed style direction is not a source.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

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

		return {
			MemberExpression(node) {
				if (node.computed) return;
				if (nameOf(node.property) !== 'direction') return;
				const object = unwrap(node.object);
				if (!object || object.type !== 'CallExpression') return;
				const callee = unwrap(object.callee);
				const called =
					nameOf(callee) === 'getComputedStyle' ||
					(callee &&
						callee.type === 'MemberExpression' &&
						nameOf(callee.property) === 'getComputedStyle');
				if (!called) return;
				context.report({ node, messageId: 'computedDirection' });
			}
		};
	}
};

export default rule;
