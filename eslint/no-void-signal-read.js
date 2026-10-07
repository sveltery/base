/**
 * Reject `void someSignal` used to force an effect dependency, including the
 * bindable publish workaround (`void actions` before `actions = handle`).
 *
 * Pass the value into the function that uses it, or read it in a `$derived`.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { effectCallback, unwrap } from './effects.js';

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow void signal reads. Pass the value into the function that uses it, or read it in a $derived.'
		},
		schema: [],
		messages: {
			voidSignal:
				'Do not force a signal read with `void`. Pass the value into the function that uses it, or read it in a `$derived`.'
		}
	},
	create(context) {
		/**
		 * @param {import('estree').Node} node
		 */
		function insideEffect(node) {
			let current =
				/** @type {{ type?: string, parent?: import('estree').Node | null } | undefined} */ (
					node.parent
				);
			while (current) {
				if (current.type === 'CallExpression' && effectCallback(current)) return true;
				current = current.parent;
			}
			return false;
		}

		/**
		 * @param {import('estree').Node} node
		 */
		function insideFunction(node) {
			let current = node.parent;
			while (current) {
				if (
					current.type === 'FunctionDeclaration' ||
					current.type === 'FunctionExpression' ||
					current.type === 'ArrowFunctionExpression'
				) {
					return true;
				}
				current = current.parent;
			}
			return false;
		}

		/**
		 * @param {import('estree').Node} node
		 */
		function isForcedRead(node) {
			if (node.type !== 'UnaryExpression' || node.operator !== 'void') return false;
			const arg = unwrap(node.argument);
			if (!arg || arg.type === 'CallExpression') return false;
			return arg.type === 'Identifier' || arg.type === 'MemberExpression';
		}

		return {
			UnaryExpression(node) {
				if (!isForcedRead(node)) return;
				if (insideEffect(node) || !insideFunction(node)) {
					context.report({ node, messageId: 'voidSignal' });
				}
			},
			ExpressionStatement(node) {
				if (!insideEffect(node)) return;
				const expr = unwrap(node.expression);
				if (!expr || expr.type === 'UnaryExpression') return;
				if (expr.type === 'Identifier' || expr.type === 'MemberExpression') {
					context.report({ node, messageId: 'voidSignal' });
				}
			}
		};
	}
};

export default rule;
