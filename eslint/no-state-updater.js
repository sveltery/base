/**
 * Reject React's functional setState shape. Assign the next value.
 * Message ids are a SvelteSet, added and deleted by id.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { calleeName, nameOf, unwrap, walk, walkOwn } from './effects.js';

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow functional state updaters. Assign the next value. Keep message ids in a SvelteSet.'
		},
		schema: [],
		messages: {
			updater:
				'Do not pass the current value into a setter. Assign the next value. Keep message ids in a SvelteSet and add or delete by id.'
		}
	},
	create(context) {
		/**
		 * @param {any} node
		 */
		function report(node) {
			if (!node) return;
			context.report({ node, messageId: 'updater' });
		}

		/**
		 * @param {any} node
		 */
		function textOf(node) {
			if (!node) return '';
			return context.sourceCode.getText(node).replace(/\s+/g, '');
		}

		/**
		 * @param {any} node
		 */
		function unwrapType(node) {
			let current = node;
			while (current?.type === 'TSParenthesizedType') current = current.typeAnnotation;
			return current;
		}

		/** @type {Map<string, any>} */
		const aliasNodes = new Map();
		/** @type {Set<string>} */
		const updaterAliases = new Set();

		/**
		 * A union of a value and `(current) => value`, including `type Update<T>`.
		 * The parameter type has to be that value. A callback union such as
		 * `boolean | ((event: MouseEvent) => boolean)` is a different shape.
		 * @param {any} node
		 */
		function isUpdaterType(node) {
			const type = unwrapType(node);
			if (!type) return false;
			if (type.type === 'TSTypeReference') {
				const name = nameOf(type.typeName);
				return name != null && updaterAliases.has(name);
			}
			if (type.type !== 'TSUnionType') return false;
			/** @type {any[]} */
			const values = [];
			/** @type {any | null} */
			let fn = null;
			for (const part of type.types ?? []) {
				const item = unwrapType(part);
				if (!item) continue;
				if (item.type === 'TSFunctionType') {
					if ((item.params?.length ?? 0) !== 1) return false;
					fn = item;
				} else {
					values.push(item);
				}
			}
			if (!fn || values.length === 0) return false;
			const param = unwrapType(fn.params[0]?.typeAnnotation?.typeAnnotation);
			if (!param) return false;
			const valueText =
				values.length === 1 ? textOf(values[0]) : values.map((item) => textOf(item)).join('|');
			return textOf(param) === valueText;
		}

		/**
		 * @param {any} fn
		 * @returns {Set<string>}
		 */
		function parameterNames(fn) {
			/** @type {Set<string>} */
			const names = new Set();
			for (const param of fn.params ?? []) {
				const name = nameOf(unwrap(param));
				if (name) names.add(name);
			}
			return names;
		}

		/**
		 * @param {any} node
		 * @returns {string | null}
		 */
		function checkedParam(node) {
			const value = unwrap(node);
			if (!value || value.type !== 'BinaryExpression') return null;
			if (value.operator === 'instanceof') {
				const left = nameOf(unwrap(value.left));
				const right = nameOf(unwrap(value.right));
				return right === 'Function' ? left : null;
			}
			if (!['===', '==', '!==', '!='].includes(value.operator)) return null;
			const sides = [unwrap(value.left), unwrap(value.right)];
			const typeofSide = sides.find(
				(side) => side?.type === 'UnaryExpression' && side.operator === 'typeof'
			);
			const literal = sides.find((side) => side?.type === 'Literal' && side.value === 'function');
			if (!literal || !typeofSide) return null;
			return nameOf(unwrap(typeofSide.argument));
		}

		/**
		 * A function that calls a parameter with the value it assigns is an updater.
		 * The name of the function does not matter. A focus helper that calls
		 * `spec(endedBy())` is not one: the argument is not the assigned value.
		 * @param {any} fn
		 */
		function reportUpdaterShape(fn) {
			if ((fn.params?.length ?? 0) === 0) return;
			const params = parameterNames(fn);
			/** @type {Set<string>} */
			const targets = new Set();
			/** @type {Map<string, string>} */
			const locals = new Map();
			walkOwn(fn.body, (node) => {
				if (node.type === 'AssignmentExpression') targets.add(textOf(node.left));
				if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier' && node.init) {
					locals.set(node.id.name, textOf(node.init));
				}
			});
			/** @type {Set<string>} */
			const checked = new Set();
			walkOwn(fn.body, (node) => {
				const name = checkedParam(node);
				if (name && params.has(name)) checked.add(name);
			});
			if (checked.size === 0 || targets.size === 0) return;
			walkOwn(fn.body, (node) => {
				if (node.type !== 'CallExpression') return;
				const callee = nameOf(unwrap(node.callee));
				if (!callee || !checked.has(callee)) return;
				const arg = node.arguments?.[0];
				if (!arg) return;
				const argNode = unwrap(arg);
				const argText = textOf(argNode);
				if (targets.has(argText)) {
					report(node);
					return;
				}
				const local = argNode?.type === 'Identifier' ? locals.get(argNode.name) : undefined;
				if (local && [...targets].some((target) => target !== '' && local.includes(target))) {
					report(node);
				}
			});
		}

		/**
		 * @param {any} node
		 * @param {Map<string, any>} inits
		 */
		function updaterFunction(node, inits) {
			const value = unwrap(node);
			if (!value) return false;
			if (value.type === 'Identifier') {
				if (!inits.has(value.name)) return false;
				return updaterFunction(inits.get(value.name), inits);
			}
			return (
				(value.type === 'ArrowFunctionExpression' ||
					value.type === 'FunctionExpression' ||
					value.type === 'FunctionDeclaration') &&
				(value.params?.length ?? 0) >= 1
			);
		}

		return {
			Program() {
				walk(context.sourceCode.ast, (node) => {
					if (node.type !== 'TSTypeAliasDeclaration') return;
					const name = nameOf(node.id);
					if (name) aliasNodes.set(name, node.typeAnnotation);
				});
				let grew = true;
				while (grew) {
					grew = false;
					for (const [name, annotation] of aliasNodes) {
						if (updaterAliases.has(name) || !isUpdaterType(annotation)) continue;
						updaterAliases.add(name);
						grew = true;
					}
				}

				walk(context.sourceCode.ast, (node) => {
					if (node.type === 'TSTypeAliasDeclaration' && isUpdaterType(node.typeAnnotation)) {
						report(node.id);
					}
					if (
						node.type === 'FunctionDeclaration' ||
						node.type === 'FunctionExpression' ||
						node.type === 'ArrowFunctionExpression'
					) {
						for (const param of node.params ?? []) {
							const value = unwrap(param);
							const annotation = value?.typeAnnotation?.typeAnnotation;
							if (isUpdaterType(annotation)) report(value);
						}
						reportUpdaterShape(node);
					}
				});

				/** @type {Map<string, any>} */
				const inits = new Map();
				walk(context.sourceCode.ast, (node) => {
					if (node.type === 'FunctionDeclaration' && node.id?.name) {
						inits.set(node.id.name, node);
					}
					if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier' || !node.init) {
						return;
					}
					inits.set(node.id.name, node.init);
				});
				const ignored = new Set(['setTimeout', 'setInterval', 'setImmediate']);
				walk(context.sourceCode.ast, (node) => {
					if (node.type !== 'CallExpression') return;
					const name = calleeName(node.callee);
					if (!name || ignored.has(name) || !/^set[A-Z]/.test(name)) return;
					for (const arg of node.arguments ?? []) {
						if (updaterFunction(arg, inits)) report(unwrap(arg) ?? arg);
					}
				});
			}
		};
	}
};

export default rule;
