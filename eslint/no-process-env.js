/**
 * Reject `process.env` and `globalThis.process` in library code.
 * Use `DEV` from `esm-env`.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow process.env and globalThis.process. Use DEV from esm-env.'
		},
		schema: [],
		messages: {
			processEnv:
				'Do not read `process.env.NODE_ENV` or `globalThis.process`. Use `DEV` from `esm-env`.'
		}
	},
	create(context) {
		/**
		 * @param {unknown} node
		 * @returns {string[]}
		 */
		function chain(node) {
			/** @type {string[]} */
			const names = [];
			let current = unwrap(node);
			while (current && current.type === 'MemberExpression') {
				const property = nameOf(current.property);
				if (property) names.unshift(property);
				current = unwrap(current.object);
			}
			const root = nameOf(current);
			if (root) names.unshift(root);
			return names;
		}

		return {
			MemberExpression(node) {
				const names = chain(node);
				const processAt = names.indexOf('process');
				if (processAt < 0) return;
				const next = names[processAt + 1];
				if (next !== 'env' && next !== 'NODE_ENV') return;
				const root = names[0];
				if (root !== 'process' && root !== 'globalThis') return;
				context.report({ node, messageId: 'processEnv' });
			}
		};
	}
};

export default rule;
