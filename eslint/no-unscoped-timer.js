/**
 * Timers are created with `useTimeout` / `useAnimationFrame`.
 * `new Timeout()`, `Timeout.create()`, `new AnimationFrame()`, and
 * `AnimationFrame.create()` belong in `src/lib/internal/timeout.ts`
 * (the classes) and `src/lib/internal/timeout.svelte.ts` (the scoped factories).
 * An import alias or a `const` alias of the class or of `.create` is the same call.
 *
 * @type {import('eslint').Rule.RuleModule}
 */

const CLASSES = new Set(['Timeout', 'AnimationFrame']);

/**
 * @param {string} filename
 */
function isAllowed(filename) {
	const path = filename.replaceAll('\\', '/');
	if (path.endsWith('/src/lib/internal/timeout.ts')) return true;
	if (path.endsWith('/src/lib/internal/timeout.svelte.ts')) return true;
	if (/\.(?:spec|test)\.[cm]?[jt]sx?$/.test(path)) return true;
	return false;
}

const WRAPPED = new Set([
	'TSAsExpression',
	'TSSatisfiesExpression',
	'TSNonNullExpression',
	'TSTypeAssertion',
	'ChainExpression',
	'ParenthesizedExpression'
]);

/**
 * @param {unknown} node
 * @returns {{ type: string, [key: string]: any } | null}
 */
function unwrap(node) {
	let current = node;
	for (;;) {
		if (!current || typeof current !== 'object') return null;
		const record = /** @type {{ type?: string, expression?: unknown }} */ (current);
		if (!record.type || !WRAPPED.has(record.type)) {
			return /** @type {{ type: string, [key: string]: any }} */ (record);
		}
		current = record.expression;
	}
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').Identifier} identifier
 */
function definitionOf(sourceCode, identifier) {
	const variable = sourceCode.getScope(identifier).set.get(identifier.name);
	return variable?.defs[0] ?? null;
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {unknown} node
 * @param {Set<import('estree').Node>} seen
 */
function resolvesToClass(sourceCode, node, seen) {
	const value = unwrap(node);
	if (!value || value.type !== 'Identifier') return false;
	if (seen.has(value)) return false;
	seen.add(value);
	const definition = definitionOf(sourceCode, value);
	if (!definition) return CLASSES.has(value.name);
	if (definition.type === 'ClassName') return CLASSES.has(value.name);
	if (definition.type === 'ImportBinding') {
		const imported = definition.node.imported;
		const name =
			imported && imported.type === 'Identifier' ? imported.name : definition.node.local.name;
		return CLASSES.has(name);
	}
	if (definition.type === 'Variable') {
		return definition.node.init ? resolvesToClass(sourceCode, definition.node.init, seen) : false;
	}
	return false;
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {unknown} node
 * @param {Set<import('estree').Node>} seen
 */
function resolvesToCreate(sourceCode, node, seen) {
	const value = unwrap(node);
	if (!value) return false;
	if (
		value.type === 'MemberExpression' &&
		value.computed === false &&
		value.property.type === 'Identifier' &&
		value.property.name === 'create'
	) {
		return resolvesToClass(sourceCode, value.object, seen);
	}
	if (value.type !== 'Identifier') return false;
	if (seen.has(value)) return false;
	seen.add(value);
	const definition = definitionOf(sourceCode, value);
	if (!definition || definition.type !== 'Variable') return false;
	const declarator = definition.node;
	if (declarator.init && resolvesToCreate(sourceCode, declarator.init, new Set())) return true;
	if (declarator.id.type !== 'ObjectPattern') return false;
	const defined = definition.name;
	const property = declarator.id.properties.find((item) => {
		if (item.type !== 'Property' || item.computed || item.value !== defined) return false;
		return item.key.type === 'Identifier' && item.key.name === 'create';
	});
	if (!property) return false;
	return resolvesToClass(sourceCode, declarator.init, seen);
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow Timeout and AnimationFrame construction outside the scoped timer factory.'
		},
		schema: [],
		messages: {
			unscoped:
				'Create this timer with `useTimeout()` or `useAnimationFrame()` from `src/lib/internal/timeout.svelte.ts` so it is cleared when the component is destroyed.'
		}
	},
	create(context) {
		if (isAllowed(context.filename)) return {};
		const sourceCode = context.sourceCode;
		return {
			NewExpression(node) {
				if (!resolvesToClass(sourceCode, node.callee, new Set())) return;
				context.report({ node: node.callee, messageId: 'unscoped' });
			},
			CallExpression(node) {
				if (!resolvesToCreate(sourceCode, node.callee, new Set())) return;
				context.report({ node: node.callee, messageId: 'unscoped' });
			}
		};
	}
};

export default rule;
