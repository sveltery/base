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
		 * @param {any} fn
		 * @param {string} ident
		 */
		function callsWithArgument(fn, ident) {
			let found = false;
			walkOwn(fn.body, (node) => {
				if (node.type !== 'CallExpression') return;
				if (nameOf(unwrap(node.callee)) !== ident) return;
				if ((node.arguments?.length ?? 0) > 0) found = true;
			});
			return found;
		}

		/**
		 * @param {any} fn
		 */
		function assigns(fn) {
			let found = false;
			walkOwn(fn.body, (node) => {
				if (node.type === 'AssignmentExpression') found = true;
			});
			return found;
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
						const names = parameterNames(node);
						if (!assigns(node)) return;
						walkOwn(node.body, (inner) => {
							if (inner.type !== 'BinaryExpression') return;
							if (inner.operator !== '===' && inner.operator !== '==') return;
							const sides = [inner.left, inner.right];
							const ident = sides.find(
								(side) => side?.type === 'UnaryExpression' && side.operator === 'typeof'
							);
							const literal = sides.find(
								(side) => side?.type === 'Literal' && side.value === 'function'
							);
							const checked = nameOf(ident?.argument);
							if (!literal || !checked || !names.has(checked)) return;
							if (!callsWithArgument(node, checked)) return;
							report(inner);
						});
					}
					if (node.type === 'CallExpression') {
						const name = calleeName(node.callee);
						if (!name || !/^set[A-Z]/.test(name)) return;
						for (const arg of node.arguments ?? []) {
							const value = unwrap(arg);
							if (
								(value?.type === 'ArrowFunctionExpression' ||
									value?.type === 'FunctionExpression') &&
								(value.params?.length ?? 0) >= 1
							) {
								report(value);
							}
						}
					}
				});
			}
		};
	}
};

export default rule;
