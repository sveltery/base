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
				'Do not use an inline function as an attachment or element binding inside `$derived`. The object is rebuilt on every read, so the element rebinds. Pass a stable function instead.'
		}
	},
	create(context) {
		const source = context.sourceCode ?? context.getSourceCode();
		const factories = attachmentFactories(source.ast);
		const attachmentNames = attachmentKeyNames(source.ast, factories);

		return {
			CallExpression(node) {
				if (!isDerived(node)) return;
				for (const argument of node.arguments ?? []) {
					walk(argument, (child) => {
						if (child.type !== 'Property' || child.kind === 'get' || child.kind === 'set') return;
						if (!isAttachmentOrBinding(child, attachmentNames, factories)) return;
						const value = unwrap(child.value);
						if (
							!value ||
							(value.type !== 'ArrowFunctionExpression' && value.type !== 'FunctionExpression')
						) {
							return;
						}
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
function isAttachmentOrBinding(property, attachmentNames, factories) {
	const key = unwrap(property.key);
	if (!key || typeof key !== 'object') return false;
	if (!property.computed) {
		const name = key.type === 'Literal' && typeof key.value === 'string' ? key.value : nameOf(key);
		return name === 'bind:this';
	}
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

export default rule;
