/**
 * Reject `$effect` / `$effect.pre` that only copy props into state.
 *
 * The copy shows up as a write counter (`seenWrites` / `seenValue`), an
 * unset-symbol controlled check, or a body that is only `state = prop`.
 * Read the prop through a model getter, or write it with a `$bindable` setter.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { effectCallback, isPropStateMirror, nameOf, propNames, walk } from './effects.js';

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow effects that copy props into state. Read props through a model getter or write them with a $bindable setter.'
		},
		schema: [],
		messages: {
			propStateSync:
				'Do not copy a prop into `$state` inside `$effect`. Read it through a model getter, or write it with a `$bindable` setter.'
		}
	},
	create(context) {
		const props = propNames(context);

		return {
			CallExpression(node) {
				const fn = effectCallback(node);
				if (!fn) return;
				let reported = false;
				walk(fn, (child) => {
					const name = nameOf(child);
					if (name === 'seenWrites' || name === 'seenValue') {
						reported = true;
						context.report({ node: child, messageId: 'propStateSync' });
					}
					if (child.type === 'Identifier' && name != null && /UNSET$/.test(name)) {
						reported = true;
						context.report({ node: child, messageId: 'propStateSync' });
					}
				});
				if (reported || !isPropStateMirror(fn, props)) return;
				walk(fn, (child) => {
					if (child.type !== 'AssignmentExpression') return;
					context.report({ node: child, messageId: 'propStateSync' });
				});
			}
		};
	}
};

export default rule;
