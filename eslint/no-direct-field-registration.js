/**
 * Field controls register through `internal/field-register-control`.
 * A direct `registerControl` call, or an alias of that method, is rejected.
 *
 * @type {import('eslint').Rule.RuleModule}
 */

const HELPER = 'src/lib/internal/field-register-control.svelte.ts';

/**
 * @param {string} filename
 */
function isHelper(filename) {
	return filename.endsWith(HELPER);
}

/**
 * @param {string} filename
 */
function isTestProbe(filename) {
	return filename.replaceAll('\\', '/').includes('/src/tests/');
}

/**
 * @param {import('estree').Node | null | undefined} node
 */
function isRegisterMember(node) {
	if (!node || node.type !== 'MemberExpression') return false;
	if (node.property.type === 'Identifier' && node.property.name === 'registerControl') {
		return node.computed === false;
	}
	return (
		node.computed === true &&
		node.property.type === 'Literal' &&
		node.property.value === 'registerControl'
	);
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').Identifier} identifier
 * @param {Set<import('estree').Node>} seen
 * @returns {import('estree').MemberExpression | null}
 */
function resolveAlias(sourceCode, identifier, seen) {
	if (seen.has(identifier)) return null;
	seen.add(identifier);
	const variable = sourceCode.getScope(identifier).set.get(identifier.name);
	const definition = variable?.defs[0];
	if (!definition || definition.type !== 'Variable') return null;
	const init = definition.node.init;
	if (!init) return null;
	if (isRegisterMember(init)) return init;
	if (init.type === 'Identifier') return resolveAlias(sourceCode, init, seen);
	return null;
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').Node} node
 * @param {Set<import('estree').Node>} seen
 */
/**
 * @param {import('estree').Node} node
 */
function isInvoke(node) {
	if (node.type !== 'MemberExpression' || node.computed) return false;
	return (
		node.property.type === 'Identifier' &&
		(node.property.name === 'bind' ||
			node.property.name === 'call' ||
			node.property.name === 'apply')
	);
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').Node} node
 * @param {Set<import('estree').Node>} seen
 * @param {Set<string>} names
 */
function resolvesToRegister(sourceCode, node, seen, names) {
	if (isRegisterMember(node)) return true;
	if (node.type === 'Identifier')
		return names.has(node.name) || resolveAlias(sourceCode, node, seen) != null;
	if (isInvoke(node)) return resolvesToRegister(sourceCode, node.object, seen, names);
	if (node.type === 'CallExpression' && isInvoke(node.callee)) {
		return resolvesToRegister(sourceCode, node.callee.object, seen, names);
	}
	return false;
}

/**
 * @param {import('estree').Node} id
 * @param {Set<string>} names
 */
function rememberPattern(id, names) {
	if (id.type !== 'ObjectPattern') return;
	for (const prop of id.properties) {
		if (prop.type !== 'Property') continue;
		const keyName =
			prop.key.type === 'Identifier'
				? prop.key.name
				: prop.key.type === 'Literal' && typeof prop.key.value === 'string'
					? prop.key.value
					: null;
		if (keyName !== 'registerControl') continue;
		const binding = prop.value.type === 'AssignmentPattern' ? prop.value.left : prop.value;
		if (binding.type === 'Identifier') names.add(binding.name);
	}
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow hand-rolled field.registerControl calls.'
		},
		schema: [],
		messages: {
			direct:
				'Register this control with `watchFieldControl` or `attachFieldControl` from `src/lib/internal/field-register-control.svelte.ts`.'
		}
	},
	create(context) {
		if (isHelper(context.filename) || isTestProbe(context.filename)) return {};
		const sourceCode = context.sourceCode;
		/** @type {Set<string>} */
		const names = new Set();
		return {
			VariableDeclarator(node) {
				rememberPattern(node.id, names);
				if (
					node.id.type === 'Identifier' &&
					node.init &&
					resolvesToRegister(sourceCode, node.init, new Set(), names)
				) {
					names.add(node.id.name);
				}
			},
			AssignmentExpression(node) {
				if (node.operator !== '=' || node.left.type !== 'Identifier') return;
				if (!resolvesToRegister(sourceCode, node.right, new Set(), names)) return;
				names.add(node.left.name);
			},
			CallExpression(node) {
				if (!resolvesToRegister(sourceCode, node.callee, new Set(), names)) return;
				context.report({ node: node.callee, messageId: 'direct' });
			}
		};
	}
};

export default rule;
