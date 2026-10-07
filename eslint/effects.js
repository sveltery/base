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
 * @param {unknown} ast
 */
export function functionsByName(ast) {
	/** @type {Map<string, unknown[]>} */
	const map = new Map();
	walk(ast, (node) => {
		if (node.type === 'FunctionDeclaration') {
			const name = nameOf(node.id);
			if (name) addFunction(map, name, node);
		}
		if (
			node.type === 'VariableDeclarator' &&
			node.init &&
			(node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')
		) {
			const name = nameOf(node.id);
			if (name) addFunction(map, name, node.init);
		}
		if (
			(node.type === 'MethodDefinition' ||
				node.type === 'PropertyDefinition' ||
				node.type === 'Property') &&
			node.value &&
			(node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression')
		) {
			const name = nameOf(node.key);
			if (name) addFunction(map, name, node.value);
		}
	});
	return map;
}

/**
 * @param {Map<string, unknown[]>} map
 * @param {string} name
 * @param {unknown} fn
 */
function addFunction(map, name, fn) {
	const list = map.get(name);
	if (list) list.push(fn);
	else map.set(name, [fn]);
}

/**
 * @param {unknown} node
 * @returns {string | null}
 */
export function parameterName(node) {
	const value = unwrap(node);
	if (!value || typeof value !== 'object') return null;
	if (value.type === 'Identifier') return nameOf(value);
	if (value.type === 'AssignmentPattern') return parameterName(value.left);
	if (value.type === 'RestElement') return parameterName(value.argument);
	return null;
}

/**
 * @param {any} node
 */
export function isValueReference(node) {
	if (!node || node.type !== 'Identifier') return false;
	const parent = node.parent;
	if (!parent) return true;
	if (
		(parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression') &&
		parent.property === node &&
		!parent.computed
	) {
		return false;
	}
	if (
		(parent.type === 'Property' ||
			parent.type === 'MethodDefinition' ||
			parent.type === 'PropertyDefinition') &&
		parent.key === node &&
		!parent.computed
	) {
		return false;
	}
	if (parent.type === 'VariableDeclarator' && parent.id === node) return false;
	if (parent.type === 'AssignmentPattern' && parent.left === node) return false;
	if (parent.type === 'RestElement' && parent.argument === node) return false;
	if (parent.type === 'FunctionDeclaration' && parent.id === node) return false;
	if (parent.type === 'LabeledStatement' && parent.label === node) return false;
	if (Array.isArray(parent.params) && parent.params.includes(node)) return false;
	return true;
}

/**
 * @param {any} node
 * @param {string} type
 */
export function hasAncestor(node, type) {
	let current = node?.parent;
	while (current) {
		if (current.type === type) return true;
		current = current.parent;
	}
	return false;
}

/**
 * @param {any} node
 */
export function insideUntrack(node) {
	let current = node?.parent;
	while (current) {
		if (current.type === 'CallExpression' && calleeName(current.callee) === 'untrack') {
			const callback = current.arguments?.[0];
			if (callback && nodeIsInside(node, callback)) return true;
		}
		current = current.parent;
	}
	return false;
}

/**
 * @param {any} node
 * @param {any} ancestor
 */
function nodeIsInside(node, ancestor) {
	let current = node;
	while (current) {
		if (current === ancestor) return true;
		current = current.parent;
	}
	return false;
}

/**
 * @param {any} fn
 * @param {string} name
 */
export function valueReferences(fn, name) {
	/** @type {any[]} */
	const refs = [];
	walk(fn.body ?? fn, (node) => {
		if (node.type === 'Identifier' && node.name === name && isValueReference(node)) refs.push(node);
	});
	return refs;
}

/**
 * @param {unknown} fn
 * @param {Map<string, unknown[]>} fns
 */
export function localCallees(fn, fns) {
	/** @type {unknown[]} */
	const found = [];
	walkOwn(/** @type {{ body?: unknown }} */ (fn).body ?? fn, (node) => {
		if (node.type !== 'CallExpression') return;
		const name = calleeName(node.callee);
		const matches = name ? fns.get(name) : undefined;
		if (!matches) return;
		for (const match of matches) {
			if (match !== fn) found.push(match);
		}
	});
	return found;
}

/**
 * @param {any} node
 * @param {(node: any) => void} visit
 */
function walkOwn(node, visit) {
	if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
	visit(node);
	if (
		node.type === 'FunctionDeclaration' ||
		node.type === 'FunctionExpression' ||
		node.type === 'ArrowFunctionExpression'
	) {
		return;
	}
	for (const key of Object.keys(node)) {
		if (key === 'parent') continue;
		const child = node[key];
		if (Array.isArray(child)) {
			for (const item of child) walkOwn(item, visit);
		} else {
			walkOwn(child, visit);
		}
	}
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
	return arg?.type === 'ArrowFunctionExpression' || arg?.type === 'FunctionExpression';
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
