/**
 * Shared walkers for the Svelte effect rules.
 * `$effect` and `$effect.pre` only. `$effect.root` is a different API.
 */

/**
 * @param {unknown} node
 */
export function unwrap(node) {
	let current = /** @type {{ type?: string, expression?: unknown } | null} */ (node);
	while (
		current &&
		(current.type === 'TSAsExpression' ||
			current.type === 'TSSatisfiesExpression' ||
			current.type === 'TSNonNullExpression' ||
			current.type === 'TSTypeAssertion' ||
			current.type === 'ChainExpression' ||
			current.type === 'ParenthesizedExpression')
	) {
		current = /** @type {{ type?: string, expression?: unknown }} */ (current.expression);
	}
	return current;
}

/**
 * @param {unknown} node
 * @returns {string | null}
 */
export function nameOf(node) {
	const value = unwrap(node);
	if (!value || typeof value !== 'object') return null;
	if (value.type === 'Identifier' || value.type === 'PrivateIdentifier') {
		return typeof value.name === 'string' ? value.name : null;
	}
	return null;
}

/**
 * @param {unknown} callee
 * @returns {'effect' | 'effect.pre' | null}
 */
export function effectKind(callee) {
	const node = unwrap(callee);
	if (!node || typeof node !== 'object') return null;
	if (node.type === 'Identifier' && node.name === '$effect') return 'effect';
	if (
		node.type === 'MemberExpression' &&
		!node.computed &&
		nameOf(node.object) === '$effect' &&
		nameOf(node.property) === 'pre'
	) {
		return 'effect.pre';
	}
	return null;
}

/**
 * @param {unknown} node
 */
export function effectCallback(node) {
	if (!node || typeof node !== 'object' || node.type !== 'CallExpression') return null;
	if (!effectKind(/** @type {{ callee?: unknown }} */ (node).callee)) return null;
	const arg = unwrap(/** @type {{ arguments?: unknown[] }} */ (node).arguments?.[0]);
	if (!arg || (arg.type !== 'ArrowFunctionExpression' && arg.type !== 'FunctionExpression')) {
		return null;
	}
	return arg;
}

/**
 * @param {unknown} node
 * @param {(node: any) => void} visit
 */
export function walk(node, visit) {
	if (!node || typeof node !== 'object') return;
	const current = /** @type {Record<string, unknown> & { type?: string }} */ (node);
	if (typeof current.type !== 'string') return;
	visit(current);
	for (const key of Object.keys(current)) {
		if (key === 'parent') continue;
		const child = current[key];
		if (Array.isArray(child)) {
			for (const item of child) walk(item, visit);
		} else {
			walk(child, visit);
		}
	}
}

/**
 * @param {unknown} node
 */
export function calleeName(node) {
	const callee = unwrap(node);
	if (!callee || typeof callee !== 'object') return null;
	if (callee.type === 'Identifier') return nameOf(callee);
	if (callee.type === 'MemberExpression') return nameOf(callee.property);
	return null;
}

/**
 * @param {unknown} node
 */
export function isAddEventListenerCall(node) {
	const call = unwrap(node);
	if (!call || call.type !== 'CallExpression') return false;
	return calleeName(call.callee) === 'addEventListener';
}

/**
 * @param {unknown} fn
 */
export function isCleanupOnly(fn) {
	if (!fn || typeof fn !== 'object') return false;
	const body = /** @type {{ body?: { type?: string, body?: unknown[], argument?: unknown } }} */ (
		fn
	).body;
	if (!body) return false;
	if (body.type !== 'BlockStatement') {
		const expr = unwrap(body);
		return expr?.type === 'ArrowFunctionExpression' || expr?.type === 'FunctionExpression';
	}
	if (body.body?.length !== 1) return false;
	const only = /** @type {{ type?: string, argument?: unknown }} */ (body.body[0]);
	if (only.type !== 'ReturnStatement' || !only.argument) return false;
	const arg = unwrap(only.argument);
	return (
		arg?.type === 'ArrowFunctionExpression' ||
		arg?.type === 'FunctionExpression' ||
		arg?.type === 'CallExpression'
	);
}

/**
 * @param {unknown} fn
 */
export function returnsCleanup(fn) {
	let found = false;
	walk(/** @type {{ body?: unknown }} */ (fn).body, (node) => {
		if (node.type !== 'ReturnStatement' || !node.argument) return;
		const arg = unwrap(node.argument);
		if (
			arg?.type === 'ArrowFunctionExpression' ||
			arg?.type === 'FunctionExpression' ||
			arg?.type === 'CallExpression'
		) {
			found = true;
		}
	});
	return found;
}

/**
 * Names bound to the result of `addEventListener` in this function.
 * @param {unknown} fn
 */
export function listenerRemoverNames(fn) {
	/** @type {Set<string>} */
	const names = new Set();
	walk(fn, (node) => {
		if (node.type === 'VariableDeclarator' && isAddEventListenerCall(node.init)) {
			const name = nameOf(node.id);
			if (name) names.add(name);
		}
		if (node.type === 'AssignmentExpression' && isAddEventListenerCall(node.right)) {
			const name = nameOf(node.left);
			if (name) names.add(name);
		}
	});
	return names;
}

/**
 * @param {unknown} node
 */
export function isRegisterCall(node) {
	const call = unwrap(node);
	if (!call || call.type !== 'CallExpression') return false;
	const name = calleeName(call.callee);
	return name != null && /register/i.test(name);
}

/**
 * @param {import('estree').Node} start
 */
export function enclosingFunction(start) {
	let current = /** @type {{ type?: string, parent?: any } | undefined} */ (start.parent);
	while (current) {
		if (
			current.type === 'FunctionDeclaration' ||
			current.type === 'FunctionExpression' ||
			current.type === 'ArrowFunctionExpression'
		) {
			return current;
		}
		if (current.type === 'Program') return current;
		current = current.parent;
	}
	return null;
}

/**
 * Prop names from `let { ... } = $props()`.
 * @param {import('eslint').Rule.RuleContext} context
 */
export function propNames(context) {
	/** @type {Set<string>} */
	const names = new Set();
	const source = context.sourceCode;
	const ast = source.ast;
	walk(ast, (node) => {
		if (node.type !== 'VariableDeclarator' || node.id?.type !== 'ObjectPattern') return;
		const init = unwrap(node.init);
		if (!init || init.type !== 'CallExpression' || nameOf(init.callee) !== '$props') {
			return;
		}
		for (const prop of node.id.properties ?? []) {
			if (prop.type === 'Property' || prop.type === 'RestElement') {
				const name = prop.type === 'Property' ? nameOf(prop.key) : null;
				if (name) names.add(name);
			}
		}
	});
	return names;
}

/**
 * @param {unknown} expr
 */
export function isPropLikeRead(expr) {
	const node = unwrap(expr);
	if (!node) return false;
	if (node.type === 'Identifier') return true;
	if (node.type === 'MemberExpression') return isPropLikeRead(node.object);
	if (node.type === 'CallExpression') {
		const name = calleeName(node.callee);
		if (name === 'Boolean' || (name != null && /^get[A-Z]/.test(name))) {
			return node.arguments.every((arg) => isPropLikeRead(arg));
		}
		return false;
	}
	if (node.type === 'LogicalExpression') {
		return isPropLikeRead(node.left) && isPropLikeRead(node.right);
	}
	if (node.type === 'ConditionalExpression') {
		return (
			isPropLikeRead(node.test) && isPropLikeRead(node.consequent) && isPropLikeRead(node.alternate)
		);
	}
	if (node.type === 'UnaryExpression' && node.operator !== 'void') {
		return isPropLikeRead(node.argument);
	}
	return false;
}

/**
 * An effect whose body is only `state = prop` / `state.field = getX()`.
 * Writes whose left side is a `$props()` binding are publishes, not copies.
 * @param {unknown} fn
 * @param {Set<string>} props
 */
export function isPropStateMirror(fn, props) {
	const body = /** @type {{ body?: { type?: string, body?: unknown[] } }} */ (fn).body;
	if (!body || body.type !== 'BlockStatement' || !body.body?.length) return false;
	let copiesState = false;
	for (const stmt of body.body) {
		if (stmt.type !== 'ExpressionStatement') return false;
		const expr = unwrap(stmt.expression);
		if (!expr || expr.type !== 'AssignmentExpression' || expr.operator !== '=') return false;
		if (!isPropLikeRead(expr.right)) return false;
		const leftName = nameOf(expr.left);
		if (expr.left?.type === 'Identifier' && leftName && props.has(leftName)) continue;
		copiesState = true;
	}
	return copiesState;
}
