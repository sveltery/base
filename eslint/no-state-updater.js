/**
 * Reject React's functional setState shape. Assign the next value.
 * Message ids are a SvelteSet, added and deleted by id.
 * Known gaps: a setter that exists only as a type, and a `.bind` alias of a setter.
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
		 * Report the call, the function check, the assignment, and the local that
		 * carried the assigned value into the call. Those can share one line.
		 * @param {any} fn
		 */
		function reportUpdaterShape(fn) {
			if ((fn.params?.length ?? 0) === 0) return;
			const params = parameterNames(fn);
			/** @type {{ text: string, node: any }[]} */
			const targets = [];
			/** @type {Map<string, { text: string, node: any }>} */
			const locals = new Map();
			walkOwn(fn.body, (node) => {
				if (node.type === 'AssignmentExpression') {
					targets.push({ text: textOf(node.left), node });
				}
				if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier' && node.init) {
					locals.set(node.id.name, { text: textOf(node.init), node });
				}
			});
			/** @type {Map<string, any>} */
			const checks = new Map();
			walkOwn(fn.body, (node) => {
				const name = checkedParam(node);
				if (name && params.has(name) && !checks.has(name)) checks.set(name, node);
			});
			if (checks.size === 0 || targets.length === 0) return;
			/** @type {Set<any>} */
			const reported = new Set();
			/**
			 * @param {any} node
			 */
			function reportOnce(node) {
				if (!node || reported.has(node)) return;
				reported.add(node);
				report(node);
			}
			walkOwn(fn.body, (node) => {
				if (node.type !== 'CallExpression') return;
				const callee = nameOf(unwrap(node.callee));
				if (!callee || !checks.has(callee)) return;
				const arg = node.arguments?.[0];
				if (!arg) return;
				const argNode = unwrap(arg);
				const argText = textOf(argNode);
				const local = argNode?.type === 'Identifier' ? locals.get(argNode.name) : undefined;
				const matched = targets.filter(
					(target) =>
						target.text !== '' &&
						(target.text === argText || (local != null && local.text.includes(target.text)))
				);
				if (matched.length === 0) return;
				reportOnce(node);
				reportOnce(checks.get(callee));
				for (const target of matched) reportOnce(target.node);
				if (local) reportOnce(local.node);
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
				/**
				 * A same-file setter whose parameter is a function stores a callback.
				 * `setRenderer((current) => current)` is that shape. An unresolved
				 * `setX`, or a setter whose parameter is a value, still counts.
				 * @param {any} fn
				 */
				function parameterExpectsCallback(fn) {
					let value = unwrap(fn);
					if (value?.type === 'Identifier') value = unwrap(inits.get(value.name));
					if (
						value?.type !== 'ArrowFunctionExpression' &&
						value?.type !== 'FunctionExpression' &&
						value?.type !== 'FunctionDeclaration'
					) {
						return false;
					}
					const param = unwrap(value.params?.[0]);
					const annotation = unwrapType(param?.typeAnnotation?.typeAnnotation);
					return annotation?.type === 'TSFunctionType';
				}
				walk(context.sourceCode.ast, (node) => {
					if (node.type !== 'CallExpression') return;
					const name = calleeName(node.callee);
					if (!name || ignored.has(name) || !/^set[A-Z]/.test(name)) return;
					if (parameterExpectsCallback(inits.get(name))) return;
					for (const arg of node.arguments ?? []) {
						if (updaterFunction(arg, inits)) report(unwrap(arg) ?? arg);
					}
				});
			}
		};
	}
};

export default rule;
