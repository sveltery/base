/**
 * A consumer callback must run outside effect tracking.
 * `callPublic` is that call. Invoking the getter result subscribes the caller
 * to whatever the callback reads.
 * Known gaps: an on* prop passed through a same-file helper, `props.onX` or a
 * destructured alias read inside `$effect`, an unbound getter alias, and getter
 * names that do not start with get or read.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { calleeName, effectKind, nameOf, unwrap, walk } from './effects.js';

const GETTER = /^(get|read)[A-Z]/;
const ON_PROP = /^on[A-Z]/;

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

		/**
		 * @param {any} node
		 */
		function enclosingFunction(node) {
			let current = node?.parent;
			while (current) {
				if (
					current.type === 'FunctionDeclaration' ||
					current.type === 'FunctionExpression' ||
					current.type === 'ArrowFunctionExpression'
				) {
					return current;
				}
				current = current.parent;
			}
			return null;
		}

		function insideEffect(node) {
			let current = node?.parent;
			while (current) {
				if (
					(current.type === 'ArrowFunctionExpression' || current.type === 'FunctionExpression') &&
					current.parent?.type === 'CallExpression' &&
					effectKind(current.parent.callee) &&
					current.parent.arguments?.[0] === current
				) {
					return true;
				}
				current = current.parent;
			}
			return false;
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
				/** @type {Set<string>} */
				const accessors = new Set();
				walk(context.sourceCode.ast, (node) => {
					const isGetter =
						(node.type === 'MethodDefinition' || node.type === 'Property') && node.kind === 'get';
					if (!isGetter) return;
					const name = nameOf(node.key);
					if (!name || !ON_PROP.test(name)) return;
					accessors.add(name);
					if (node.key) report(node.key);
				});

				/**
				 * @param {any} node
				 */
				function isCallbackSource(node) {
					if (isGetterCall(node) || isCallbackValue(node)) return true;
					const value = unwrap(node);
					if (value?.type !== 'MemberExpression' || value.computed) return false;
					const prop = nameOf(value.property);
					return prop != null && accessors.has(prop);
				}

				/** @type {Map<any, Set<string>>} */
				const wrappedParams = new Map();
				let grew = true;
				while (grew) {
					grew = false;
					walk(context.sourceCode.ast, (node) => {
						if (node.type !== 'VariableDeclarator' && node.type !== 'AssignmentExpression') return;
						const id = node.type === 'VariableDeclarator' ? node.id : node.left;
						const init = node.type === 'VariableDeclarator' ? node.init : node.right;
						if (id?.type === 'ArrayPattern') {
							const elements = init?.type === 'ArrayExpression' ? init.elements : [];
							id.elements?.forEach((element, index) => {
								const local = nameOf(element);
								if (local && !callbackValues.has(local) && isCallbackSource(elements[index])) {
									callbackValues.add(local);
									grew = true;
								}
							});
							return;
						}
						const local = nameOf(id);
						if (!local || callbackValues.has(local)) return;
						if (isCallbackSource(init)) {
							callbackValues.add(local);
							grew = true;
						}
					});
					/** @type {{ node: any, name: string, params: string[] }[]} */
					const functions = [];
					walk(context.sourceCode.ast, (node) => {
						if (
							node.type !== 'FunctionDeclaration' &&
							node.type !== 'FunctionExpression' &&
							node.type !== 'ArrowFunctionExpression'
						) {
							return;
						}
						const params = (node.params ?? [])
							.map((param) => nameOf(unwrap(param)))
							.filter((name) => typeof name === 'string');
						const name =
							node.type === 'FunctionDeclaration'
								? nameOf(node.id)
								: node.parent?.type === 'VariableDeclarator'
									? nameOf(node.parent.id)
									: null;
						if (name) functions.push({ node, name, params });
					});
					walk(context.sourceCode.ast, (node) => {
						if (node.type !== 'CallExpression') return;
						const called = calleeName(node.callee);
						if (called === 'callPublic') return;
						const fn = functions.find((item) => item.name === called);
						if (!fn) return;
						const marked = wrappedParams.get(fn.node) ?? new Set();
						fn.params.forEach((param, index) => {
							if (marked.has(param) || !isCallbackSource(node.arguments?.[index])) return;
							marked.add(param);
							wrappedParams.set(fn.node, marked);
							grew = true;
						});
					});
				}

				walk(context.sourceCode.ast, (node) => {
					if (node.type !== 'CallExpression') return;
					const callee = unwrap(node.callee);
					if (callee?.type === 'Identifier' && callee.name === 'callPublic') return;
					if (insideEffect(node)) {
						const prop =
							callee?.type === 'MemberExpression' ? nameOf(callee.property) : calleeName(callee);
						if (prop && ON_PROP.test(prop)) {
							report(node);
							return;
						}
					}
					const ownerFn = enclosingFunction(node);
					const localCallee = callee?.type === 'Identifier' ? callee.name : null;
					if (ownerFn && localCallee && wrappedParams.get(ownerFn)?.has(localCallee)) {
						report(node);
						return;
					}
					if (isCallbackSource(callee) || isCallbackValue(callee)) {
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
