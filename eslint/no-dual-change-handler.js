/**
 * One value change has one handler. `oninput` is that handler.
 * `onchange` repeating it validates twice.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap, walk } from './effects.js';

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow binding the same change handler to both oninput and onchange.'
		},
		schema: [],
		messages: {
			dual: 'Keep the change handler on `oninput` only. A second `onchange` runs field validation again.'
		}
	},
	create(context) {
		/** @type {Map<string, any>} */
		const objects = new Map();
		/** @type {Map<string, string>} */
		const wrappers = new Map();

		/**
		 * Svelte attribute names are `SvelteName`, not `Identifier`.
		 * @param {any} node
		 */
		function eventName(node) {
			const value = unwrap(node);
			if (!value) return null;
			if (value.type === 'SvelteName' && typeof value.name === 'string') return value.name;
			return nameOf(value);
		}

		/**
		 * @param {any} fn
		 * @returns {string | null}
		 */
		function soleCallee(fn) {
			if (
				!fn ||
				(fn.type !== 'ArrowFunctionExpression' &&
					fn.type !== 'FunctionExpression' &&
					fn.type !== 'FunctionDeclaration')
			) {
				return null;
			}
			let body = fn.body;
			if (body?.type === 'BlockStatement') {
				if (body.body?.length !== 1) return null;
				const statement = body.body[0];
				if (statement.type === 'ExpressionStatement') body = statement.expression;
				else if (statement.type === 'ReturnStatement') body = statement.argument;
				else return null;
			}
			const call = unwrap(body);
			if (call?.type !== 'CallExpression') return null;
			return nameOf(unwrap(call.callee));
		}

		/**
		 * @param {string | null} name
		 * @param {Set<string>} seen
		 */
		function rootName(name, seen) {
			if (!name) return null;
			const next = wrappers.get(name);
			if (!next || seen.has(name)) return name;
			seen.add(name);
			return rootName(next, seen);
		}

		/**
		 * @param {any} node
		 */
		function identity(node) {
			const value = unwrap(node);
			if (!value) return null;
			if (value.type === 'Identifier') return rootName(value.name, new Set());
			return rootName(soleCallee(value), new Set());
		}

		/**
		 * @param {any} node
		 * @param {Set<any>} seen
		 * @returns {{ event: string, name: string, node: any }[]}
		 */
		function handlersFrom(node, seen) {
			const value = unwrap(node);
			if (!value || seen.has(value)) return [];
			seen.add(value);
			if (value.type === 'Identifier') {
				const object = objects.get(value.name);
				return object ? handlersFrom(object, seen) : [];
			}
			if (value.type !== 'ObjectExpression') return [];
			/** @type {{ event: string, name: string, node: any }[]} */
			const found = [];
			for (const prop of value.properties ?? []) {
				if (prop.type === 'SpreadElement' || prop.type === 'SpreadProperty') {
					found.push(...handlersFrom(prop.argument, seen));
					continue;
				}
				if (prop.type !== 'Property') continue;
				const key = eventName(prop.key);
				if (key !== 'oninput' && key !== 'onchange') continue;
				const name = identity(prop.value);
				if (name) found.push({ event: key, name, node: prop });
			}
			return found;
		}

		/**
		 * @param {any} attribute
		 */
		function attributeExpression(attribute) {
			const value = attribute.value;
			if (Array.isArray(value)) {
				const tag = value.find((item) => item?.type === 'SvelteMustacheTag');
				return tag?.expression ?? null;
			}
			if (value?.type === 'SvelteMustacheTag') return value.expression;
			return value ?? null;
		}

		/**
		 * @param {any} element
		 * @param {Set<any>} seen
		 */
		function elementHandlers(element, seen) {
			/** @type {{ event: string, name: string, node: any }[]} */
			const found = [];
			const attributes = element.attributes ?? element.startTag?.attributes ?? [];
			for (const attribute of attributes) {
				if (attribute.type === 'SvelteSpreadAttribute') {
					found.push(...handlersFrom(attribute.argument, seen));
					continue;
				}
				if (attribute.type !== 'SvelteAttribute') continue;
				const key = eventName(attribute.key);
				if (key !== 'oninput' && key !== 'onchange') continue;
				const name = identity(attributeExpression(attribute));
				if (name) found.push({ event: key, name, node: attribute });
			}
			return found;
		}

		/**
		 * @param {{ event: string, name: string, node: any }[]} handlers
		 */
		function reportDual(handlers) {
			const input = handlers.filter((handler) => handler.event === 'oninput');
			const change = handlers.filter((handler) => handler.event === 'onchange');
			if (input.length === 0 || change.length === 0) return;
			for (const left of input) {
				for (const right of change) {
					if (left.name !== right.name) continue;
					context.report({ node: right.node, messageId: 'dual' });
				}
			}
		}

		return {
			Program() {
				walk(context.sourceCode.ast, (node) => {
					if (node.type === 'FunctionDeclaration') {
						const name = nameOf(node.id);
						const callee = soleCallee(node);
						if (name && callee) wrappers.set(name, callee);
					}
					if (
						node.type === 'VariableDeclarator' &&
						node.id?.type === 'Identifier' &&
						node.init &&
						(node.init.type === 'ArrowFunctionExpression' ||
							node.init.type === 'FunctionExpression')
					) {
						const callee = soleCallee(node.init);
						if (callee) wrappers.set(node.id.name, callee);
					}
					if (
						node.type === 'VariableDeclarator' &&
						node.id?.type === 'Identifier' &&
						unwrap(node.init)?.type === 'ObjectExpression'
					) {
						objects.set(node.id.name, unwrap(node.init));
					}
				});
				walk(context.sourceCode.ast, (node) => {
					if (node.type === 'ObjectExpression') reportDual(handlersFrom(node, new Set()));
					if (node.type === 'SvelteElement') reportDual(elementHandlers(node, new Set()));
				});
			}
		};
	}
};

export default rule;
