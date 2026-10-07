/**
 * Reject parent registration and `addEventListener` whose cleanup is split
 * out of the effect that started them.
 *
 * Register with `{@attach}`, or listen with `on()` from `svelte/events`,
 * and return the cleanup from that same attachment.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import {
	effectCallback,
	enclosingFunction,
	isAddEventListenerCall,
	isCleanupOnly,
	isRegisterCall,
	listenerRemoverNames,
	returnsCleanup,
	walk
} from './effects.js';

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow registration and addEventListener inside $effect when cleanup is split out. Use {@attach} or on() from svelte/events.'
		},
		schema: [],
		messages: {
			splitLifecycle:
				'Do not register or call `addEventListener` inside `$effect` with cleanup in another effect. Use `{@attach}` or `on()` from `svelte/events`, and return the cleanup from that same attachment.'
		}
	},
	create(context) {
		/** @type {Map<object, import('estree').Node[]>} */
		const effectsByOwner = new Map();
		/** @type {import('estree').Node[]} */
		const listenerCalls = [];
		const reported = new Set();

		/**
		 * @param {import('estree').Node} node
		 */
		function report(node) {
			if (reported.has(node)) return;
			reported.add(node);
			context.report({ node, messageId: 'splitLifecycle' });
		}

		return {
			CallExpression(node) {
				const fn = effectCallback(node);
				if (fn) {
					const owner = enclosingFunction(node) ?? context.sourceCode.ast;
					const list = effectsByOwner.get(owner) ?? [];
					list.push(node);
					effectsByOwner.set(owner, list);
				}
				if (isAddEventListenerCall(node)) listenerCalls.push(node);
			},
			'Program:exit'() {
				for (const [owner, effects] of effectsByOwner) {
					const removers = listenerRemoverNames(owner);
					const cleanup = [];
					const registrars = [];
					for (const effect of effects) {
						const fn = effectCallback(effect);
						if (!fn) continue;
						if (isCleanupOnly(fn)) cleanup.push(effect);
						if (callsRegister(fn) && !returnsCleanup(fn)) registrars.push(effect);
					}
					if (cleanup.length > 0 && registrars.length > 0) {
						for (const effect of registrars) {
							const fn = effectCallback(effect);
							if (!fn) continue;
							walk(fn, (child) => {
								if (isRegisterCall(child)) report(child);
							});
						}
						for (const effect of cleanup) report(effect);
					}
					for (const effect of cleanup) {
						const fn = effectCallback(effect);
						if (!fn || removers.size === 0) continue;
						walk(fn, (child) => {
							if (child.type === 'Identifier' && removers.has(child.name)) report(child);
						});
					}
				}

				for (const call of listenerCalls) {
					if (callIsInsideEffect(call)) report(call);
				}
			}
		};
	}
};

/**
 * @param {unknown} fn
 */
function callsRegister(fn) {
	let found = false;
	walk(fn, (node) => {
		if (isRegisterCall(node)) found = true;
	});
	return found;
}

/**
 * @param {import('estree').Node} node
 */
function callIsInsideEffect(node) {
	let current = /** @type {{ type?: string, parent?: any } | undefined} */ (node.parent);
	while (current) {
		if (current.type === 'CallExpression' && effectCallback(current)) return true;
		current = current.parent;
	}
	return false;
}

export default rule;
