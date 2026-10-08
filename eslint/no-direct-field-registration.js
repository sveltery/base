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
function resolvesToRegister(sourceCode, node, seen) {
	if (isRegisterMember(node)) return true;
	if (node.type === 'Identifier') return resolveAlias(sourceCode, node, seen) != null;
	return false;
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
		if (isHelper(context.filename)) return {};
		const sourceCode = context.sourceCode;
		return {
			CallExpression(node) {
				if (!resolvesToRegister(sourceCode, node.callee, new Set())) return;
				context.report({ node: node.callee, messageId: 'direct' });
			}
		};
	}
};

export default rule;
