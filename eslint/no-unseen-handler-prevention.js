/**
 * Reject a part handler that calls the consumer's handler for an event that cannot be
 * canceled, then reads `event.defaultPrevented` to skip itself. The flag stays false on such
 * an event, so the consumer's `preventDefault()` never reaches the check. `chain()` from
 * `internal/mergeProps.js` records that call.
 *
 * `touchstart` and `touchmove` are in the list because Svelte listens to them passively.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { nameOf, unwrap } from './effects.js';

const UNCANCELABLE = new Set([
	'abort',
	'animationcancel',
	'animationend',
	'animationiteration',
	'animationstart',
	'blur',
	'change',
	'compositionend',
	'compositionupdate',
	'error',
	'focus',
	'focusin',
	'focusout',
	'gotpointercapture',
	'input',
	'load',
	'lostpointercapture',
	'mouseenter',
	'mouseleave',
	'pointercancel',
	'pointerenter',
	'pointerleave',
	'scroll',
	'scrollend',
	'select',
	'toggle',
	'touchmove',
	'touchstart',
	'transitioncancel',
	'transitionend',
	'transitionrun',
	'transitionstart'
]);

/**
 * The event name of `onfocus(event)`, `props.onfocus?.(event)` or `onfocus.call(this, event)`,
 * and the argument that holds the event.
 *
 * @param {any} node
 * @returns {{ event: string, argument: unknown } | null}
 */
function handlerCall(node) {
	let callee = unwrap(node.callee);
	let argument = node.arguments[0];
	if (
		callee?.type === 'MemberExpression' &&
		!callee.computed &&
		nameOf(callee.property) === 'call'
	) {
		callee = unwrap(callee.object);
		argument = node.arguments[1];
	}
	const name =
		callee?.type === 'MemberExpression' && !callee.computed
			? nameOf(callee.property)
			: nameOf(callee);
	if (!name || !name.startsWith('on')) return null;
	return { event: name.slice(2), argument };
}

const FUNCTION_TYPES = new Set([
	'FunctionDeclaration',
	'FunctionExpression',
	'ArrowFunctionExpression'
]);

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow reading `defaultPrevented` after calling a consumer handler for an event that cannot be canceled.'
		},
		schema: [],
		messages: {
			unseen:
				'`{{event}}` cannot be canceled, so `defaultPrevented` stays false after `{{handler}}` calls `preventDefault()`. Use `chain(partHandler, {{handler}})` from internal/mergeProps.js.'
		}
	},
	create(context) {
		/** @type {{ event: string, handler: string, name: string, fn: any, end: number }[]} */
		const calls = [];
		/** @type {{ node: any, name: string, start: number }[]} */
		const reads = [];

		return {
			CallExpression(node) {
				const call = handlerCall(node);
				if (!call || !UNCANCELABLE.has(call.event)) return;
				const name = nameOf(call.argument);
				if (!name) return;
				const fn = context.sourceCode
					.getAncestors(node)
					.findLast((ancestor) => FUNCTION_TYPES.has(ancestor.type));
				if (!fn) return;
				calls.push({
					event: call.event,
					handler: `on${call.event}`,
					name,
					fn,
					end: node.range[1]
				});
			},
			MemberExpression(node) {
				if (node.computed || nameOf(node.property) !== 'defaultPrevented') return;
				const name = nameOf(node.object);
				if (name) reads.push({ node, name, start: node.range[0] });
			},
			'Program:exit'() {
				for (const read of reads) {
					const call = calls.find(
						(item) =>
							item.name === read.name && read.start > item.end && read.start < item.fn.range[1]
					);
					if (!call) continue;
					context.report({
						node: read.node,
						messageId: 'unseen',
						data: { event: call.event, handler: call.handler }
					});
				}
			}
		};
	}
};

export default rule;
