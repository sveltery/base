/**
 * Layout reads inside `$derived` run while Svelte is computing state, and they
 * do not subscribe to size or scroll. Measure in a ResizeObserver or scroll
 * attachment and write `$state`.
 *
 * Follows one call into a function in the same file or a named import, and a
 * same-file function passed as `$derived.by(compute)`.
 *
 * Still missed:
 * - el['getBoundingClientRect']()
 * - a helper two calls deep
 * - barrel re-exports
 * - namespace imports
 * - reads nested in callbacks or untrack
 * - window.innerWidth
 * - getClientRects()
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import {
	calleeName,
	fileOf,
	functionsByName,
	importBindings,
	isDerivedCall,
	loadNamedFunction,
	nameOf,
	unwrap,
	walkOwn
} from './effects.js';

const LAYOUT_METHODS = new Set(['getBoundingClientRect', 'getComputedStyle', 'checkVisibility']);
const EVENT_COORDS = new Set(['clientX', 'clientY', 'offsetX', 'offsetY']);

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow layout reads inside $derived. Measure from a ResizeObserver or scroll attachment and write $state.'
		},
		schema: [],
		messages: {
			layout:
				'Do not read layout inside `$derived`. Measure from a ResizeObserver or scroll attachment and write `$state`.'
		}
	},
	create(context) {
		const source = context.sourceCode ?? context.getSourceCode();
		const fns = functionsByName(source.ast);
		const imports = importBindings(source.ast);
		const filename = fileOf(context);

		/**
		 * @param {any} node
		 */
		function report(node) {
			context.report({ node, messageId: 'layout' });
		}

		/**
		 * @param {string} name
		 */
		function calleeBody(name) {
			const imported = imports.get(name);
			if (imported) {
				const fn = loadNamedFunction(filename, imported.source, imported.imported);
				return fn?.body ?? null;
			}
			for (const fn of fns.get(name) ?? []) {
				if (fn?.body && layoutReads(fn.body).length > 0) return fn.body;
			}
			return null;
		}

		return {
			CallExpression(node) {
				if (!isDerivedCall(node)) return;
				const region = node.arguments?.[0];
				if (!region) return;
				const argument = unwrap(region);
				if (argument?.type === 'Identifier') {
					const body = calleeBody(argument.name);
					if (body && layoutReads(body).length > 0) report(argument);
				}
				for (const read of layoutReads(region)) report(read);
				for (const call of directCalls(region)) {
					const name = calleeName(call.callee);
					if (!name || LAYOUT_METHODS.has(name)) continue;
					const body = calleeBody(name);
					if (!body) continue;
					if (layoutReads(body).length > 0) report(call);
				}
			}
		};
	}
};

/**
 * @param {any} node
 */
function layoutReads(node) {
	/** @type {any[]} */
	const found = [];
	const root = unwrap(node);
	const body =
		root &&
		(root.type === 'ArrowFunctionExpression' || root.type === 'FunctionExpression') &&
		root.body
			? root.body
			: node;
	walkOwn(body, (child) => {
		if (isLayoutRead(child)) found.push(child);
	});
	return found;
}

/**
 * Calls in this region, not calls inside a nested function.
 * @param {any} node
 */
function directCalls(node) {
	/** @type {any[]} */
	const found = [];
	const root = unwrap(node);
	const body =
		root &&
		(root.type === 'ArrowFunctionExpression' || root.type === 'FunctionExpression') &&
		root.body
			? root.body
			: node;
	walkOwn(body, (child) => {
		if (child.type === 'CallExpression') found.push(child);
	});
	return found;
}

/**
 * @param {any} node
 */
function isLayoutRead(node) {
	if (!node || node.type === 'ChainExpression') return isLayoutRead(unwrap(node));
	if (node.type === 'CallExpression') {
		const callee = unwrap(node.callee);
		if (!callee) return false;
		if (callee.type === 'Identifier') return LAYOUT_METHODS.has(callee.name);
		if (
			(callee.type === 'MemberExpression' || callee.type === 'OptionalMemberExpression') &&
			!callee.computed
		) {
			return LAYOUT_METHODS.has(nameOf(callee.property) ?? '');
		}
		return false;
	}
	if (
		(node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') &&
		!node.computed
	) {
		const name = nameOf(node.property);
		if (!isLayoutProp(name)) return false;
		if (node.parent?.type === 'AssignmentExpression' && node.parent.left === node) return false;
		if (node.parent?.type === 'UpdateExpression') return false;
		if (node.parent?.type === 'CallExpression' && node.parent.callee === node) return false;
		return true;
	}
	if (node.type === 'Property' && node.parent?.type === 'ObjectPattern' && !node.computed) {
		return isLayoutProp(nameOf(node.key));
	}
	return false;
}

/**
 * @param {string | null} name
 */
function isLayoutProp(name) {
	if (!name || EVENT_COORDS.has(name)) return false;
	// `scrollingY` is component state. Layout reads are the DOM measurements.
	return /^(offset|client|scroll)(Width|Height|Left|Top|Right|Bottom|X|Y|Parent)$/.test(name);
}

export default rule;
