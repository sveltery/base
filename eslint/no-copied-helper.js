/**
 * Shared helpers live in `src/lib/internal`. A second function or class with
 * the same name, or a second copy of the platform probes, is rejected.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

/** @type {Record<string, string>} */
const OWNERS = {
	toCssStyle: 'src/lib/internal/css-style.ts',
	mergeCssStyle: 'src/lib/internal/css-style.ts',
	ownerDocument: 'src/lib/internal/owner.ts',
	ownerWindow: 'src/lib/internal/owner.ts',
	activeElement: 'src/lib/internal/shadow-dom.ts',
	getTarget: 'src/lib/internal/shadow-dom.ts',
	contains: 'src/lib/internal/shadow-dom.ts',
	byDocumentOrder: 'src/lib/internal/document-order.ts',
	dispatchClick: 'src/lib/internal/click.ts',
	currentHost: 'src/lib/internal/click.ts',
	isLink: 'src/lib/internal/click.ts',
	findAssociatedLabel: 'src/lib/internal/associated-label.ts',
	Timeout: 'src/lib/internal/timeout.ts',
	runOnceAnimationsFinish: 'src/lib/internal/animations-finished.ts',
	AnimationFrame: 'src/lib/internal/timeout.ts',
	TimeoutManager: 'src/lib/internal/timeout.ts',
	useButton: 'src/lib/internal/useButton.ts',
	buttonProps: 'src/lib/internal/useButton.ts',
	guardDisabled: 'src/lib/internal/useButton.ts',
	nonNativeKeys: 'src/lib/internal/useButton.ts',
	adaptiveOriginMiddleware: 'src/lib/internal/adaptiveOriginMiddleware.ts',
	adaptiveOrigin: 'src/lib/internal/adaptiveOriginMiddleware.ts',
	useOpenInteractionType: 'src/lib/internal/openInteraction.ts',
	createDefaultInitialFocus: 'src/lib/internal/popups/popupStoreUtils.ts',
	resolveFocus: 'src/lib/internal/popups/popupStoreUtils.ts',
	COMPOSITE_KEYS: 'src/lib/internal/composite-keys.ts',
	PopupHandle: 'src/lib/internal/popups/popupHandle.svelte.ts',
	PopoverHandle: 'src/lib/internal/popups/popupHandle.svelte.ts'
};

/**
 * @param {string} filename
 * @param {string} owner
 */
function isOwner(filename, owner) {
	return filename.endsWith(owner);
}

/**
 * @param {unknown} node
 * @returns {string | null}
 */
function declaredHelper(node) {
	const value = unwrap(node);
	if (!value) return null;
	if (
		(value.type === 'FunctionDeclaration' || value.type === 'ClassDeclaration') &&
		value.id &&
		typeof value.id.name === 'string'
	) {
		return OWNERS[value.id.name] ? value.id.name : null;
	}
	if (value.type !== 'VariableDeclarator' || value.id?.type !== 'Identifier') return null;
	if (!OWNERS[value.id.name] || value.init == null) return null;
	return value.id.name;
}

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow a second copy of a shared internal helper.'
		},
		schema: [],
		messages: {
			copiedHelper: 'Do not copy `{{name}}`. Import it from `{{owner}}`.',
			copiedPlatform:
				'Do not copy platform detection. Import `platform` from `src/lib/internal/platform.ts`.'
		}
	},
	create(context) {
		const filename = context.filename.replaceAll('\\', '/');
		if (filename.includes('.spec.')) return {};

		return {
			FunctionDeclaration(node) {
				const name = declaredHelper(node);
				if (!name || isOwner(filename, OWNERS[name])) return;
				context.report({ node, messageId: 'copiedHelper', data: { name, owner: OWNERS[name] } });
			},
			ClassDeclaration(node) {
				const name = declaredHelper(node);
				if (!name || isOwner(filename, OWNERS[name])) return;
				context.report({ node, messageId: 'copiedHelper', data: { name, owner: OWNERS[name] } });
			},
			VariableDeclarator(node) {
				const name = declaredHelper(node);
				if (!name || isOwner(filename, OWNERS[name])) return;
				context.report({ node, messageId: 'copiedHelper', data: { name, owner: OWNERS[name] } });
			},
			CallExpression(node) {
				if (isOwner(filename, 'src/lib/internal/platform.ts')) return;
				const callee = unwrap(node.callee);
				if (!callee || callee.type !== 'MemberExpression') return;
				if (nameOf(callee.property) !== 'supports') return;
				const object = unwrap(callee.object);
				if (nameOf(object) !== 'CSS') return;
				const probe = unwrap(node.arguments?.[0]);
				if (
					probe &&
					probe.type === 'Literal' &&
					typeof probe.value === 'string' &&
					probe.value.includes('-webkit-backdrop-filter')
				) {
					context.report({ node, messageId: 'copiedPlatform' });
				}
			},
			Literal(node) {
				if (isOwner(filename, 'src/lib/internal/platform.ts')) return;
				if (node.regex?.pattern === '^i(os$|p)') {
					context.report({ node, messageId: 'copiedPlatform' });
				}
			}
		};
	}
};

export default rule;
