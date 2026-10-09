/**
 * Timers are created with `useTimeout` / `useInterval` / `useAnimationFrame`.
 * `new Timeout()`, `Timeout.create()`, `new Interval()`, `new AnimationFrame()`, and
 * `AnimationFrame.create()` belong in `src/lib/internal/timeout.ts`
 * (the classes) and `src/lib/internal/timeout.svelte.ts` (the scoped factories).
 * An import alias or a `const` alias of the class or of `.create` is the same call.
 *
 * @type {import('eslint').Rule.RuleModule}
 */

const CLASSES = new Set(['Timeout', 'AnimationFrame', 'Interval']);

/**
 * @param {string} filename
 */
function isAllowed(filename) {
	const path = filename.replaceAll('\\', '/');
	if (path.endsWith('/src/lib/internal/timeout.ts')) return true;
	if (path.endsWith('/src/lib/internal/timeout.svelte.ts')) return true;
	if (/\.(?:spec|test|e2e)\.[cm]?[jt]sx?$/.test(path)) return true;
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

function namespaceImport(sourceCode, node) {
	const value = unwrap(node);
	if (!value || value.type !== 'Identifier') return false;
	const definition = definitionOf(sourceCode, value);
	return (
		definition?.type === 'ImportBinding' && definition.node.type === 'ImportNamespaceSpecifier'
	);
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {unknown} node
 * @param {Set<import('estree').Node>} seen
 */
function resolvesToClass(sourceCode, node, seen) {
	const value = unwrap(node);
	if (
		value &&
		value.type === 'MemberExpression' &&
		value.computed === false &&
		value.property.type === 'Identifier' &&
		CLASSES.has(value.property.name)
	) {
		return namespaceImport(sourceCode, value.object);
	}
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

const RAW_TIMERS = new Set(['setTimeout', 'setInterval', 'requestAnimationFrame']);

/**
 * A global `setTimeout`, `setInterval`, or `requestAnimationFrame`, including `globalThis.setTimeout`.
 * A local binding with that name is left alone.
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').CallExpression} node
 */
function rawTimerCall(sourceCode, node) {
	const callee = unwrap(node.callee);
	if (!callee) return false;
	if (callee.type === 'Identifier' && RAW_TIMERS.has(callee.name)) {
		const variable = sourceCode.getScope(callee).set.get(callee.name);
		return !variable || variable.defs.length === 0;
	}
	if (
		callee.type !== 'MemberExpression' ||
		callee.computed ||
		callee.property.type !== 'Identifier' ||
		!RAW_TIMERS.has(callee.property.name)
	) {
		return false;
	}
	const owner = unwrap(callee.object);
	if (!owner || owner.type !== 'Identifier') return false;
	return owner.name === 'globalThis' || owner.name === 'window' || owner.name === 'global';
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

/**
 * `AnimationFrame.request` while a popup is unmounting.
 * `useAnimationFrame()` cancels in its `$effect` cleanup, so the frame that puts
 * focus back on the trigger after a backdrop click would never run. This file is
 * the allowlist entry for that call. `new AnimationFrame()` here is still rejected.
 * @param {string} filename
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').CallExpression} node
 */
function isUnmountReturnFrame(filename, sourceCode, node) {
	const path = filename.replaceAll('\\', '/');
	if (
		!path.endsWith('/src/lib/internal/floating-ui-react/components/FloatingFocusManager.svelte')
	) {
		return false;
	}
	return isAnimationFrameRequest(sourceCode, node);
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('estree').CallExpression} node
 */
function isAnimationFrameRequest(sourceCode, node) {
	const callee = unwrap(node.callee);
	if (!callee || callee.type !== 'MemberExpression' || callee.computed) return false;
	if (callee.property.type !== 'Identifier' || callee.property.name !== 'request') return false;
	return resolvesToClass(sourceCode, callee.object, new Set());
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
				'Create this timer with `useTimeout()`, `useInterval()`, or `useAnimationFrame()` from `src/lib/internal/timeout.svelte.ts` so it is cleared when the component is destroyed.'
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
				if (isUnmountReturnFrame(context.filename, sourceCode, node)) return;
				if (
					rawTimerCall(sourceCode, node) ||
					resolvesToCreate(sourceCode, node.callee, new Set()) ||
					isAnimationFrameRequest(sourceCode, node)
				) {
					context.report({ node: node.callee, messageId: 'unscoped' });
				}
			}
		};
	}
};

export default rule;
