/**
 * A getter passed into a class belongs in the constructor.
 * A placeholder `readX = () => literal`, or an arrow assigned onto that
 * field afterwards, is a second binding the next reader can miss.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { unwrap } from './effects.js';

/**
 * @param {string | null | undefined} name
 */
function isLateBoundName(name) {
	if (!name) return false;
	return /Reader$/.test(name) || /^read[A-Z]/.test(name);
}

/**
 * @param {any} node
 * @returns {string | null}
 */
function propertyName(node) {
	if (!node) return null;
	if (node.type === 'Identifier') return node.name;
	if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
	return null;
}

/**
 * @param {any} node
 */
function isFunctionLike(node) {
	const value = unwrap(node);
	if (!value) return false;
	if (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') return true;
	if (value.type === 'Identifier') return true;
	if (value.type === 'LogicalExpression' || value.type === 'ConditionalExpression') {
		return (
			isFunctionLike(value.left ?? value.test) ||
			isFunctionLike(value.right ?? value.consequent) ||
			isFunctionLike(value.alternate)
		);
	}
	return false;
}

/**
 * @param {any} node
 */
function isArrowOrFunction(node) {
	const value = unwrap(node);
	return value?.type === 'ArrowFunctionExpression' || value?.type === 'FunctionExpression';
}

/**
 * @param {any} node
 */
function enclosingFunction(node) {
	let current = node?.parent;
	while (current) {
		if (
			current.type === 'FunctionExpression' ||
			current.type === 'FunctionDeclaration' ||
			current.type === 'ArrowFunctionExpression'
		) {
			return current;
		}
		current = current.parent;
	}
	return null;
}

/**
 * @param {any} fn
 */
function isConstructor(fn) {
	return fn?.parent?.type === 'MethodDefinition' && fn.parent.kind === 'constructor';
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow a class getter that is given a placeholder and assigned after construction.'
		},
		schema: [],
		messages: {
			placeholder:
				'Pass this getter through the constructor. A placeholder `readX = () => …` is assigned too late.',
			assigned:
				'Pass this getter through the constructor. Do not assign `readX = () => …` after the class is created.'
		}
	},
	create(context) {
		/**
		 * @param {any} node
		 * @param {string | null} name
		 */
		function reportAssigned(node, name) {
			if (!isLateBoundName(name)) return;
			context.report({ node, messageId: 'assigned' });
		}

		return {
			PropertyDefinition(node) {
				const name = propertyName(node.key);
				if (!isLateBoundName(name) || !node.value) return;
				if (!isArrowOrFunction(node.value)) return;
				context.report({ node: node.value, messageId: 'placeholder' });
			},
			AssignmentExpression(node) {
				if (node.operator !== '=' || node.left?.type !== 'MemberExpression') return;
				if (node.left.computed && node.left.property?.type !== 'Literal') return;
				const name = propertyName(node.left.property);
				if (!isLateBoundName(name) || !isFunctionLike(node.right)) return;
				const fn = enclosingFunction(node);
				if (isConstructor(fn) && !isArrowOrFunction(node.right)) return;
				reportAssigned(node, name);
			},
			CallExpression(node) {
				const callee = unwrap(node.callee);
				const isAssign =
					callee?.type === 'MemberExpression' &&
					!callee.computed &&
					callee.object?.type === 'Identifier' &&
					callee.object.name === 'Object' &&
					callee.property?.type === 'Identifier' &&
					callee.property.name === 'assign';
				if (!isAssign) return;
				for (const arg of node.arguments.slice(1)) {
					reportAssignBag(arg);
				}
			}
		};

		/**
		 * @param {any} node
		 */
		function reportAssignBag(node) {
			const value = unwrap(node);
			if (!value) return;
			if (value.type === 'ObjectExpression') {
				for (const prop of value.properties) {
					if (prop.type === 'SpreadElement') {
						reportAssignBag(prop.argument);
						continue;
					}
					if (prop.type !== 'Property') continue;
					const name = propertyName(prop.key);
					const init = prop.value;
					if (!isLateBoundName(name) || !isFunctionLike(init)) continue;
					context.report({ node: prop, messageId: 'assigned' });
				}
			}
		}
	}
};

export default rule;
