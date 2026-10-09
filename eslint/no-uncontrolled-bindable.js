/**
 * `value`, `checked`, `open`, and `pressed` are controllable.
 * A `$bindable` declaration has to go through `createControllableValue`
 * (or be forwarded with `bind:` to a part that does).
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { isValueReference, unwrap, walk } from './effects.js';

const PROPS = new Set(['value', 'checked', 'open', 'pressed']);

/**
 * `createControllableValue<T>(...)` is a call whose callee is a type instantiation.
 * @param {any} node
 * @returns {string | null}
 */
function calleeName(node) {
	const value = unwrap(node);
	if (!value) return null;
	if (value.type === 'Identifier') return value.name;
	if (value.type === 'TSInstantiationExpression') return calleeName(value.expression);
	return null;
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {any} node
 * @param {Set<string>} seen
 */
function resolvesCallee(sourceCode, node, seen) {
	const callee = unwrap(node);
	if (!callee || callee.type !== 'Identifier') return false;
	if (callee.name === '$bindable') return true;
	if (seen.has(callee.name)) return false;
	seen.add(callee.name);
	const variable = sourceCode.getScope(callee).set.get(callee.name);
	const init = unwrap(variable?.defs?.[0]?.node?.init);
	if (!init) return false;
	if (init.type === 'Identifier') return resolvesCallee(sourceCode, init, seen);
	return false;
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {any} node
 * @param {Set<string>} seen
 */
function resolvesToBindable(sourceCode, node, seen) {
	const value = unwrap(node);
	if (!value || value.type !== 'CallExpression') return false;
	return resolvesCallee(sourceCode, value.callee, seen);
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {any} node
 * @param {string} name
 * @param {Set<string>} seen
 */
function referencesProp(sourceCode, node, name, seen) {
	let found = false;
	walk(node, (child) => {
		if (child.type !== 'Identifier' || child.name === name || !isValueReference(child)) return;
		if (seen.has(child.name)) return;
		const variable = sourceCode.getScope(child).set.get(child.name);
		const init = variable?.defs?.[0]?.node?.init;
		if (!init) return;
		seen.add(child.name);
		walk(init, (inner) => {
			if (inner.type === 'Identifier' && inner.name === name && isValueReference(inner))
				found = true;
		});
	});
	walk(node, (child) => {
		if (child.type === 'Identifier' && child.name === name && isValueReference(child)) found = true;
	});
	return found;
}

/**
 * Real `bind:name` directives. A comment or a longer name is not a forward.
 * @param {unknown} ast
 */
function bindingNames(ast) {
	/** @type {Set<string>} */
	const names = new Set();
	walk(ast, (node) => {
		if (node.type !== 'SvelteDirective' || node.kind !== 'Binding') return;
		const key = node.key;
		const nameNode = key?.name;
		const name =
			nameNode?.type === 'Identifier' || nameNode?.type === 'SvelteName'
				? nameNode.name
				: typeof nameNode === 'string'
					? nameNode
					: null;
		if (typeof name === 'string') names.add(name);
	});
	return names;
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow a controllable $bindable prop that does not use createControllableValue.'
		},
		schema: [],
		messages: {
			uncontrolled:
				'Route `{{name}}` through `createControllableValue`, or forward it with `bind:{{name}}`.'
		}
	},
	create(context) {
		const sourceCode = context.sourceCode;
		/** @type {any[]} */
		const calls = [];
		/** @type {{ name: string, node: any }[]} */
		const bindables = [];

		return {
			CallExpression(node) {
				if (calleeName(node.callee) === 'createControllableValue') calls.push(node);
			},
			Property(node) {
				if (!node.parent || node.parent.type !== 'ObjectPattern') return;
				const name = node.key?.type === 'Identifier' ? node.key.name : null;
				if (!name || !PROPS.has(name)) return;
				const value = node.value;
				const init = value?.type === 'AssignmentPattern' ? value.right : value;
				if (!init || !resolvesToBindable(sourceCode, init, new Set())) return;
				bindables.push({ name, node: init });
			},
			'Program:exit'() {
				const forwarded = bindingNames(sourceCode.ast);
				for (const bindable of bindables) {
					const routed = calls.some((call) =>
						referencesProp(sourceCode, call, bindable.name, new Set())
					);
					if (forwarded.has(bindable.name) || routed) continue;
					context.report({
						node: bindable.node,
						messageId: 'uncontrolled',
						data: { name: bindable.name }
					});
				}
			}
		};
	}
};

export default rule;
