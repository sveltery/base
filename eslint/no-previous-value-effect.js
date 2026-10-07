/**
 * Reject `$effect` that remembers `sawX` / `previousX` / `lastKey` so it can
 * fire a change after the fact.
 *
 * Run the side effect on the path that commits the value.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { effectCallback, walk } from './effects.js';

const PREVIOUS = /^(saw|previous)[A-Z]/;
const SNAPSHOT = new Set(['lastKey', 'lastMessage']);

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow effects that diff a previous value to fire a change. Run the side effect on the commit path.'
		},
		schema: [],
		messages: {
			previousValue:
				'Do not watch a previous value inside `$effect` to fire a change. Run the side effect on the path that commits the value.'
		}
	},
	create(context) {
		return {
			CallExpression(node) {
				const fn = effectCallback(node);
				if (!fn) return;
				walk(fn, (child) => {
					if (child.type !== 'Identifier' || typeof child.name !== 'string') return;
					if (PREVIOUS.test(child.name) || SNAPSHOT.has(child.name)) {
						context.report({ node: child, messageId: 'previousValue' });
					}
				});
			}
		};
	}
};

export default rule;
