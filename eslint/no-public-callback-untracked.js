/**
 * A consumer callback must run outside effect tracking.
 * `callPublic` is that call. Invoking the getter result subscribes the caller
 * to whatever the callback reads.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { calleeName, nameOf, unwrap, walk } from './effects.js';

const GETTER = /^(get|read)[A-Z]/;

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow invoking a public callback returned by a getter. Call it through callPublic.'
		},
		schema: [],
		messages: {
			tracked:
				'Do not invoke a public callback directly. Call it through `callPublic` so the callback is not tracked.'
		}
	},
	create(context) {
		/** @type {Set<string>} */
		const getterFns = new Set();
		/** @type {Set<string>} */
		const callbackValues = new Set();

		/**
		 * @param {any} node
		 */
		function isGetterCallee(node) {
			const name = calleeName(node);
			if (!name) return false;
			if (GETTER.test(name)) return true;
			const value = unwrap(node);
			return value?.type === 'Identifier' && getterFns.has(value.name);
		}

		/**
		 * @param {any} node
		 */
		function isGetterCall(node) {
			const value = unwrap(node);
			if (!value || value.type !== 'CallExpression') return false;
			if ((value.arguments?.length ?? 0) !== 0) return false;
			return isGetterCallee(value.callee);
		}

		/**
		 * @param {any} node
		 */
		function isCallbackValue(node) {
			const value = unwrap(node);
			if (isGetterCall(value)) return true;
			return value?.type === 'Identifier' && callbackValues.has(value.name);
		}

		/**
		 * @param {any} node
		 */
		function report(node) {
			context.report({ node, messageId: 'tracked' });
		}

		return {
			Program() {
				walk(context.sourceCode.ast, (node) => {
					const id = node.type === 'VariableDeclarator' ? node.id : null;
					if (id?.type !== 'ObjectPattern') return;
					for (const prop of id.properties ?? []) {
						if (prop.type !== 'Property') continue;
						const key = nameOf(prop.key);
						const local = nameOf(prop.value);
						if (key && local && GETTER.test(key)) getterFns.add(local);
					}
				});
				walk(context.sourceCode.ast, (node) => {
					if (node.type !== 'VariableDeclarator' && node.type !== 'AssignmentExpression') return;
					const id = node.type === 'VariableDeclarator' ? node.id : node.left;
					const init = node.type === 'VariableDeclarator' ? node.init : node.right;
					if (id?.type === 'ArrayPattern') {
						const elements = init?.type === 'ArrayExpression' ? init.elements : [];
						id.elements?.forEach((element, index) => {
							const local = nameOf(element);
							if (local && isGetterCall(elements[index])) callbackValues.add(local);
						});
						return;
					}
					const local = nameOf(id);
					if (!local) return;
					if (isGetterCall(init)) callbackValues.add(local);
				});

				walk(context.sourceCode.ast, (node) => {
					if (node.type !== 'CallExpression') return;
					const callee = unwrap(node.callee);
					if (callee?.type === 'Identifier' && callee.name === 'callPublic') return;
					if (isCallbackValue(callee)) {
						report(node);
						return;
					}
					if (callee?.type === 'MemberExpression' && !callee.computed) {
						const method = nameOf(callee.property);
						if ((method === 'call' || method === 'apply') && isCallbackValue(callee.object)) {
							report(node);
						}
					}
					const called = calleeName(callee);
					if (called !== 'apply') return;
					const owner = unwrap(callee);
					if (owner?.type !== 'MemberExpression' || nameOf(owner.object) !== 'Reflect') return;
					if (isCallbackValue(node.arguments?.[0])) report(node);
				});
			}
		};
	}
};

export default rule;
