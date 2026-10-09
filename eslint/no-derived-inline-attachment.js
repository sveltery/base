/**
 * An inline function used as an attachment or element binding inside `$derived`
 * is a new value every time that object is read, so the element rebinds.
 * Pass a stable function instead.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { calleeName, nameOf, unwrap, walk } from './effects.js';

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow inline attachment or element-binding functions inside $derived props.'
		},
		schema: [],
		messages: {
			inline:
				'Do not build an attachment key or an inline attachment function inside `$derived`. The object is rebuilt when a dependency changes, so the element rebinds. Pass a stable function and a key created outside the derived.'
		}
	},
	create(context) {
		const source = context.sourceCode ?? context.getSourceCode();
		const factories = attachmentFactories(source.ast);
		const attachmentNames = attachmentKeyNames(source.ast, factories);

		const helpers = helpersReturningAttachment(source.ast);

		return {
			CallExpression(node) {
				if (!isDerived(node)) return;
				for (const argument of node.arguments ?? []) {
					const localFns = new Set();
					walk(argument, (child) => {
						if (child.type === 'FunctionDeclaration') {
							const id = nameOf(child.id);
							if (id) localFns.add(id);
							return;
						}
						if (child.type === 'VariableDeclarator') {
							const id = nameOf(child.id);
							const init = unwrap(child.init);
							if (id && isFunction(init)) localFns.add(id);
							return;
						}
						if (child.type === 'AssignmentExpression' && child.operator === '=') {
							const id = nameOf(child.left);
							if (id && isFunction(unwrap(child.right))) localFns.add(id);
						}
					});
					walk(argument, (child) => {
						if (child.type === 'CallExpression') {
							const called = calleeName(child.callee);
							if (called && (factories.has(called) || helpers.has(called))) {
								context.report({ node: child, messageId: 'inline' });
							}
						}
						if (child.type !== 'Property' || child.kind === 'get' || child.kind === 'set') return;
						if (!isAttachmentOrBinding(child, attachmentNames, factories)) return;
						const value = unwrap(child.value);
						if (!value || !isUnstableAttachment(value, localFns, helpers)) return;
						context.report({ node: value, messageId: 'inline' });
					});
				}
			}
		};
	}
};

/**
 * Local names of `createAttachmentKey`, including import aliases.
 * @param {unknown} ast
 */
function attachmentFactories(ast) {
	/** @type {Set<string>} */
	const names = new Set(['createAttachmentKey']);
	walk(ast, (node) => {
		if (node.type !== 'ImportSpecifier') return;
		if (nameOf(node.imported) !== 'createAttachmentKey') return;
		const local = nameOf(node.local) ?? 'createAttachmentKey';
		names.add(local);
	});
	return names;
}

/**
 * Variables initialized with `createAttachmentKey()`.
 * @param {unknown} ast
 * @param {Set<string>} factories
 */
function attachmentKeyNames(ast, factories) {
	/** @type {Set<string>} */
	const names = new Set();
	walk(ast, (node) => {
		if (node.type !== 'VariableDeclarator') return;
		const id = nameOf(node.id);
		const init = unwrap(node.init);
		if (!id || !init || init.type !== 'CallExpression') return;
		const factory = calleeName(init.callee);
		if (factory && factories.has(factory)) names.add(id);
	});
	return names;
}

/**
 * @param {unknown} node
 */
function isDerived(node) {
	const call = /** @type {{ callee?: unknown }} */ (node);
	const callee = unwrap(call.callee);
	if (!callee || typeof callee !== 'object') return false;
	if (callee.type === 'Identifier' && callee.name === '$derived') return true;
	return (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		nameOf(callee.object) === '$derived' &&
		nameOf(callee.property) === 'by'
	);
}

/**
 * @param {{ computed?: boolean, key?: unknown }} property
 * @param {Set<string>} attachmentNames
 * @param {Set<string>} factories
 */
/**
 * `bind:this` cannot be spread as an attachment key, so it is not an attachment.
 * @param {{ computed?: boolean, key?: unknown }} property
 * @param {Set<string>} attachmentNames
 * @param {Set<string>} factories
 */
function isAttachmentOrBinding(property, attachmentNames, factories) {
	if (!property.computed) return false;
	const key = unwrap(property.key);
	if (!key || typeof key !== 'object') return false;
	if (key.type === 'Identifier') {
		const name = nameOf(key);
		return name != null && attachmentNames.has(name);
	}
	if (key.type === 'CallExpression') {
		const factory = calleeName(key.callee);
		return factory != null && factories.has(factory);
	}
	return false;
}

/**
 * @param {unknown} node
 */
function isFunction(node) {
	const value = unwrap(node);
	return Boolean(
		value && (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression')
	);
}

/**
 * @param {unknown} value
 * @param {Set<string>} localFns
 * @param {Set<string>} helpers
 */
function isUnstableAttachment(value, localFns, helpers) {
	const node = unwrap(value);
	if (!node) return false;
	if (isFunction(node)) return true;
	if (node.type === 'Identifier' && localFns.has(node.name)) return true;
	if (node.type === 'ConditionalExpression') {
		return (
			isUnstableAttachment(node.consequent, localFns, helpers) ||
			isUnstableAttachment(node.alternate, localFns, helpers)
		);
	}
	if (node.type === 'CallExpression') {
		const callee = unwrap(node.callee);
		if (
			callee?.type === 'MemberExpression' &&
			!callee.computed &&
			nameOf(callee.property) === 'bind'
		) {
			return true;
		}
		const called = calleeName(node.callee);
		return called != null && helpers.has(called);
	}
	return false;
}

/**
 * Functions that return `{ [k]: <function> }`.
 * @param {unknown} ast
 */
function helpersReturningAttachment(ast) {
	/** @type {Set<string>} */
	const names = new Set();
	walk(ast, (node) => {
		let name = null;
		let body = null;
		if (node.type === 'FunctionDeclaration') {
			name = nameOf(node.id);
			body = node.body;
		}
		if (
			node.type === 'VariableDeclarator' &&
			(isFunction(node.init) || unwrap(node.init)?.type === 'ArrowFunctionExpression')
		) {
			name = nameOf(node.id);
			body = unwrap(node.init)?.body;
		}
		if (!name || !body) return;
		if (returnsComputedFunction(body)) names.add(name);
	});
	return names;
}

/**
 * @param {unknown} body
 */
function returnsComputedFunction(body) {
	let found = false;
	const root = unwrap(body);
	if (root?.type === 'ObjectExpression') found = objectHasComputedFunction(root);
	walk(body, (node) => {
		if (node.type !== 'ReturnStatement') return;
		const argument = unwrap(node.argument);
		if (argument?.type === 'ObjectExpression' && objectHasComputedFunction(argument)) found = true;
	});
	return found;
}

/**
 * @param {{ properties?: unknown[] }} object
 */
function objectHasComputedFunction(object) {
	for (const prop of object.properties ?? []) {
		if (!prop || prop.type !== 'Property' || !prop.computed) continue;
		if (isFunction(prop.value)) return true;
	}
	return false;
}

export default rule;
