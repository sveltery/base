/**
 * Reject an effect that compares a value against the copy it stored on its
 * previous run. The variable name is irrelevant. Run the side effect on the
 * path that commits the value.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { effectCallback, functionsByName, localCallees, nameOf, unwrap } from './effects.js';

const COMPARE = new Set(['===', '==', '!==', '!=']);

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
		const fns = functionsByName(context.sourceCode.ast);

		/**
		 * @param {any} node
		 * @returns {string | null}
		 */
		function pathOf(node) {
			const value = unwrap(node);
			if (!value) return null;
			if (value.type === 'Identifier') return nameOf(value);
			if (value.type === 'ThisExpression') return 'this';
			if (value.type === 'MemberExpression' && !value.computed) {
				const objectPath = pathOf(value.object);
				const property = nameOf(value.property);
				if (objectPath && property) return `${objectPath}.${property}`;
			}
			return null;
		}

		/**
		 * @param {any} node
		 * @param {(node: any) => void} visit
		 */
		function walkOwn(node, visit) {
			if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
			visit(node);
			if (
				node.type === 'FunctionDeclaration' ||
				node.type === 'FunctionExpression' ||
				node.type === 'ArrowFunctionExpression'
			) {
				return;
			}
			for (const key of Object.keys(node)) {
				if (key === 'parent') continue;
				const child = node[key];
				if (Array.isArray(child)) {
					for (const item of child) walkOwn(item, visit);
				} else {
					walkOwn(child, visit);
				}
			}
		}

		/**
		 * @param {any} node
		 */
		function isLiteralish(node) {
			const value = unwrap(node);
			if (!value) return false;
			if (value.type === 'Literal') return true;
			if (value.type === 'TemplateLiteral' && value.expressions?.length === 0) return true;
			if (
				value.type === 'Identifier' &&
				(value.name === 'undefined' || value.name === 'NaN' || value.name === 'Infinity')
			) {
				return true;
			}
			if (
				value.type === 'UnaryExpression' &&
				(value.operator === '-' || value.operator === '+') &&
				value.argument?.type === 'Literal'
			) {
				return true;
			}
			return false;
		}

		/**
		 * @param {any} fn
		 * @param {Set<any>} reported
		 */
		function reportStoredComparisons(fn, reported) {
			/** @type {Map<string, any>} */
			const assigned = new Map();
			/** @type {Set<string>} */
			const armed = new Set();
			/** @type {Map<string, string>} */
			const aliases = new Map();
			const body = fn.body ?? fn;

			walkOwn(body, (node) => {
				if (node.type !== 'AssignmentExpression' || node.operator !== '=') return;
				const key = pathOf(node.left);
				if (!key) return;
				const ownsSlot = node.left.type === 'Identifier' || key.startsWith('this.');
				if (!ownsSlot) return;
				const right = unwrap(node.right);
				if (right && !isLiteralish(right)) assigned.set(key, node.left);
				if (right?.type === 'Literal' && right.value === true && node.left.type === 'Identifier') {
					armed.add(node.left.name);
				}
			});

			walkOwn(body, (node) => {
				if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier') return;
				const init = unwrap(node.init);
				if (!init || init.type !== 'Identifier') return;
				const target = init.name;
				if (assigned.has(target)) aliases.set(node.id.name, target);
			});

			/**
			 * @param {any} expr
			 * @returns {string | null}
			 */
			function resolve(expr) {
				const value = unwrap(expr);
				if (!value) return null;
				if (value.type === 'Identifier') return aliases.get(value.name) ?? value.name;
				return pathOf(value);
			}

			/**
			 * @param {string | null} key
			 */
			function storedKey(key) {
				if (!key) return null;
				if (assigned.has(key)) return key;
				for (const candidate of assigned.keys()) {
					if (key.startsWith(`${candidate}.`)) return candidate;
				}
				return null;
			}

			/**
			 * @param {any} left
			 * @param {any} right
			 */
			function noteComparison(left, right) {
				if (isLiteralish(left) || isLiteralish(right)) return;
				for (const expr of [left, right]) {
					const key = storedKey(resolve(expr));
					if (!key) continue;
					const target = assigned.get(key);
					if (target && !reported.has(target)) {
						reported.add(target);
						context.report({ node: target, messageId: 'previousValue' });
					}
				}
			}

			walkOwn(body, (node) => {
				if (node.type === 'BinaryExpression' && COMPARE.has(node.operator)) {
					noteComparison(node.left, node.right);
				}
				if (node.type === 'CallExpression') {
					const callee = unwrap(node.callee);
					const isObjectIs =
						callee?.type === 'MemberExpression' &&
						!callee.computed &&
						nameOf(callee.object) === 'Object' &&
						nameOf(callee.property) === 'is';
					if (isObjectIs && node.arguments?.length >= 2) {
						noteComparison(node.arguments[0], node.arguments[1]);
					}
				}
				if (node.type !== 'IfStatement' || !returnsImmediately(node.consequent)) return;
				const flag = negatedIdentifier(node.test);
				if (!flag || !armed.has(flag.name) || reported.has(flag)) return;
				reported.add(flag);
				context.report({ node: flag, messageId: 'previousValue' });
			});
		}

		/**
		 * @param {any} node
		 */
		function returnsImmediately(node) {
			if (!node) return false;
			if (node.type === 'ReturnStatement') return true;
			if (node.type !== 'BlockStatement') return false;
			return node.body?.some((statement) => statement.type === 'ReturnStatement') === true;
		}

		/**
		 * @param {any} node
		 * @returns {any}
		 */
		function negatedIdentifier(node) {
			const value = unwrap(node);
			if (!value) return null;
			if (
				value.type === 'UnaryExpression' &&
				value.operator === '!' &&
				value.argument?.type === 'Identifier'
			) {
				return value.argument;
			}
			if (value.type === 'LogicalExpression') {
				return negatedIdentifier(value.left) ?? negatedIdentifier(value.right);
			}
			return null;
		}

		return {
			CallExpression(node) {
				const fn = effectCallback(node);
				if (!fn) return;
				const reported = new Set();
				reportStoredComparisons(fn, reported);
				for (const callee of localCallees(fn, fns)) {
					reportStoredComparisons(callee, reported);
				}
			}
		};
	}
};

export default rule;
