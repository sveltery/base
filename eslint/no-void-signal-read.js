/**
 * Reject `void someSignal` used to force an effect dependency, and a signal
 * passed into a parameter that the function never reads (`_param`), only
 * reads inside `untrack`, or only returns to a caller that ignores it.
 *
 * Pass the value into the function that uses it, or read it in a `$derived`.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import {
	calleeName,
	effectCallback,
	fileOf,
	functionsByName,
	hasAncestor,
	importBindings,
	insideUntrack,
	isDerivedCall,
	loadNamedFunction,
	nameOf,
	parameterName,
	unwrap,
	valueReferences,
	walk
} from './effects.js';

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow void signal reads. Pass the value into the function that uses it, or read it in a $derived.'
		},
		schema: [],
		messages: {
			voidSignal:
				'Do not force a signal read with `void`. Pass the value into the function that uses it, or read it in a `$derived`.',
			alwaysTrue:
				'Do not force a signal read with an always-true condition. Pass the value into the function that uses it, or read it in a `$derived`.',
			identicalBranches:
				'Do not force a signal read with identical branches. Pass the value into the function that uses it, or read it in a `$derived`.',
			comparisonCounter:
				'Do not force a signal read with a comparison counter. Pass the value into the function that uses it, or read it in a `$derived`.'
		}
	},
	create(context) {
		const source = context.sourceCode ?? context.getSourceCode();
		const fns = functionsByName(source.ast);
		const imports = importBindings(source.ast);
		const filename = fileOf(context);
		/** @type {Set<any>} */
		const reportedParams = new Set();

		/**
		 * @param {any} node
		 */
		function insideEffect(node) {
			let current = node?.parent;
			while (current) {
				if (current.type === 'CallExpression' && effectCallback(current)) return true;
				current = current.parent;
			}
			return false;
		}

		/**
		 * @param {any} node
		 */
		function insideDerived(node) {
			let current = node?.parent;
			while (current) {
				if (current.type === 'CallExpression' && isDerivedCall(current)) return true;
				current = current.parent;
			}
			return false;
		}

		/**
		 * @param {any} node
		 */
		function enclosingFunction(node) {
			let current = node?.parent;
			while (current) {
				if (
					current.type === 'FunctionDeclaration' ||
					current.type === 'FunctionExpression' ||
					current.type === 'ArrowFunctionExpression'
				) {
					return current;
				}
				current = current.parent;
			}
			return null;
		}

		function insideFunction(node) {
			let current = node?.parent;
			while (current) {
				if (
					current.type === 'FunctionDeclaration' ||
					current.type === 'FunctionExpression' ||
					current.type === 'ArrowFunctionExpression'
				) {
					return true;
				}
				current = current.parent;
			}
			return false;
		}

		/**
		 * @param {any} node
		 */
		function isForcedRead(node) {
			if (node.type !== 'UnaryExpression' || node.operator !== 'void') return false;
			const arg = unwrap(node.argument);
			if (!arg || arg.type === 'CallExpression') return false;
			return arg.type === 'Identifier' || arg.type === 'MemberExpression';
		}

		/**
		 * @param {any} node
		 */
		function isSignalArgument(node) {
			const value = unwrap(node);
			if (!value) return false;
			if (value.type === 'SpreadElement') return false;
			if (value.type === 'Identifier' || value.type === 'MemberExpression') return true;
			return false;
		}

		/**
		 * @param {any} fn
		 * @param {string} name
		 */
		function feedsOnlyReturn(fn, name) {
			const refs = valueReferences(fn, name);
			if (refs.length === 0) return false;
			return refs.every((ref) => {
				if (hasAncestor(ref, 'ReturnStatement')) return true;
				const declarator = declaratorInitOf(ref);
				if (!declarator || declarator.id?.type !== 'Identifier') return false;
				const aliasRefs = valueReferences(fn, declarator.id.name);
				return (
					aliasRefs.length > 0 && aliasRefs.every((alias) => hasAncestor(alias, 'ReturnStatement'))
				);
			});
		}

		/**
		 * @param {any} node
		 */
		function declaratorInitOf(node) {
			let current = node?.parent;
			while (current) {
				if (current.type === 'VariableDeclarator' && current.init && contains(current.init, node)) {
					return current;
				}
				if (
					current.type === 'FunctionDeclaration' ||
					current.type === 'FunctionExpression' ||
					current.type === 'ArrowFunctionExpression' ||
					current.type === 'ReturnStatement'
				) {
					return null;
				}
				current = current.parent;
			}
			return null;
		}

		/**
		 * @param {any} ancestor
		 * @param {any} node
		 */
		function contains(ancestor, node) {
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
		 * @param {boolean} returnIgnored
		 */
		function parameterUnread(fn, name, returnIgnored) {
			const refs = valueReferences(fn, name);
			if (refs.length === 0) return true;
			if (refs.every((ref) => insideUntrack(ref) && !isMeaningfulUse(ref))) return true;
			if (returnIgnored && feedsOnlyReturn(fn, name) && hasSideEffectWithout(fn, name)) return true;
			return false;
		}

		/**
		 * @param {any} ref
		 */
		function isMeaningfulUse(ref) {
			let current = ref.parent;
			while (current) {
				if (current.type === 'AssignmentExpression' && contains(current.right, ref)) return true;
				if (current.type === 'ReturnStatement') return true;
				if (current.type === 'ArrayExpression' || current.type === 'Property') return true;
				if (
					current.type === 'CallExpression' &&
					calleeName(current.callee) !== 'untrack' &&
					current.arguments?.some((argument) => contains(argument, ref))
				) {
					return true;
				}
				if (current.type === 'NewExpression') return true;
				if (
					(current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression') &&
					current.object === ref
				) {
					return true;
				}
				current = current.parent;
			}
			return false;
		}

		/**
		 * @param {any} fn
		 * @param {string} name
		 */
		function hasSideEffectWithout(fn, name) {
			const body = fn.body;
			if (!body || body.type !== 'BlockStatement') return false;
			return body.body.some((statement) => {
				if (statement.type === 'ReturnStatement') return false;
				const refs = [];
				walkStatements(statement, (node) => {
					if (node.type === 'Identifier' && node.name === name) refs.push(node);
				});
				return refs.length === 0;
			});
		}

		/**
		 * @param {any} node
		 * @param {(node: any) => void} visit
		 */
		function walkStatements(node, visit) {
			if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
			visit(node);
			for (const key of Object.keys(node)) {
				if (key === 'parent') continue;
				const child = node[key];
				if (Array.isArray(child)) {
					for (const item of child) walkStatements(item, visit);
				} else {
					walkStatements(child, visit);
				}
			}
		}

		/**
		 * @param {any} call
		 * @param {any} fn
		 */
		function reportUnreadArguments(call, fn) {
			const params = fn.params ?? [];
			const returnIgnored = call.parent?.type === 'ExpressionStatement';
			call.arguments?.forEach((argument, index) => {
				if (!isSignalArgument(argument)) return;
				const name = parameterName(params[index]);
				if (!name || !parameterUnread(fn, name, returnIgnored)) return;
				context.report({ node: argument, messageId: 'voidSignal' });
			});
		}

		/**
		 * @param {any} fn
		 */
		function reportUntrackOnlyParameters(fn) {
			for (const param of fn.params ?? []) {
				const name = parameterName(param);
				if (!name || reportedParams.has(param)) continue;
				const refs = valueReferences(fn, name);
				if (refs.length === 0) continue;
				if (!refs.every((ref) => insideUntrack(ref) && !isMeaningfulUse(ref))) continue;
				reportedParams.add(param);
				context.report({ node: param, messageId: 'voidSignal' });
			}
		}

		/**
		 * @param {any} node
		 */
		function effectFunction(node) {
			let current = node;
			while (current) {
				if (current.type === 'CallExpression') {
					const callback = effectCallback(current);
					if (callback) return callback;
				}
				current = current.parent;
			}
			return null;
		}

		/**
		 * @param {any} fn
		 * @param {string} name
		 * @param {any} declaratorId
		 */
		function copiedIntoUntrack(fn, name, declaratorId) {
			const refs = valueReferences(fn, name).filter((ref) => ref !== declaratorId);
			return refs.length > 0 && refs.every((ref) => insideUntrack(ref) && !isMeaningfulUse(ref));
		}

		/**
		 * A local that only renames parameters, then reads them inside `untrack`,
		 * exists to subscribe at the call. `const next = value` in an effect is a
		 * real capture: `value` is not a parameter.
		 *
		 * @param {any} init
		 * @param {any} fn
		 */
		function snapshotsParameters(init, fn) {
			/** @type {Set<string>} */
			const params = new Set();
			for (const param of fn.params ?? []) {
				const name = parameterName(param);
				if (name) params.add(name);
			}
			if (params.size === 0) return false;
			/** @type {any[]} */
			const ids = [];
			collectIdentifiers(init, ids);
			return ids.length > 0 && ids.every((id) => params.has(id.name));
		}

		/**
		 * @param {any} node
		 * @param {any[]} ids
		 */
		function collectIdentifiers(node, ids) {
			if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
			if (
				node.type === 'FunctionExpression' ||
				node.type === 'ArrowFunctionExpression' ||
				node.type === 'FunctionDeclaration'
			) {
				return;
			}
			if (node.type === 'Identifier') {
				ids.push(node);
				return;
			}
			for (const key of Object.keys(node)) {
				if (key === 'parent') continue;
				const child = node[key];
				if (Array.isArray(child)) {
					for (const item of child) collectIdentifiers(item, ids);
				} else {
					collectIdentifiers(child, ids);
				}
			}
		}

		return {
			UnaryExpression(node) {
				if (!isForcedRead(node)) return;
				if (insideEffect(node) || insideDerived(node) || !insideFunction(node)) {
					context.report({ node, messageId: 'voidSignal' });
				}
			},
			ExpressionStatement(node) {
				if (!insideEffect(node) && !insideDerived(node)) return;
				const expr = unwrap(node.expression);
				if (!expr || expr.type === 'UnaryExpression') return;
				if (expr.type === 'Identifier' || expr.type === 'MemberExpression') {
					context.report({ node, messageId: 'voidSignal' });
				}
			},
			CallExpression(node) {
				reportUnreadObjectProps(node, fns, imports, filename, context);
				if (!insideEffect(node) && !insideDerived(node) && insideFunction(node)) return;
				if (
					!insideEffect(node) &&
					!insideDerived(node) &&
					node.parent?.type !== 'ExpressionStatement'
				)
					return;
				const name = calleeName(node.callee);
				const matches = name ? fns.get(name) : undefined;
				if (!matches) return;
				for (const fn of matches) reportUnreadArguments(node, fn);
			},
			VariableDeclarator(node) {
				if (node.id?.type !== 'Identifier' || !node.init) return;
				const name = node.id.name;
				const fn = effectFunction(node) ?? enclosingFunction(node);
				if (!fn) return;
				const refs = valueReferences(fn, name).filter((ref) => ref !== node.id);
				const init = unwrap(node.init);
				const signalInit = init && (init.type === 'Identifier' || init.type === 'MemberExpression');
				if ((effectFunction(node) || insideDerived(node)) && refs.length === 0 && signalInit) {
					context.report({ node, messageId: 'voidSignal' });
					return;
				}
				if (snapshotsParameters(init, fn) && copiedIntoUntrack(fn, name, node.id)) {
					context.report({ node, messageId: 'voidSignal' });
				}
			},
			FunctionDeclaration(node) {
				reportUntrackOnlyParameters(node);
			},
			FunctionExpression(node) {
				reportUntrackOnlyParameters(node);
			},
			ArrowFunctionExpression(node) {
				reportUntrackOnlyParameters(node);
			},
			IfStatement(node) {
				// A helper called from an effect is not nested in that effect, so
				// limiting this to `insideEffect` lets the forced read through.
				// An `||` whose operands are used in the branch is a real condition.
				// Outside an effect that is not a forced subscription.
				if (isAlwaysTrue(node.test) && !realOrOutsideEffect(node)) {
					context.report({ node: node.test, messageId: 'alwaysTrue' });
				} else if (inequalityCount(node.test) >= 4 && isOnlyReturn(node.consequent)) {
					context.report({ node: node.test, messageId: 'comparisonCounter' });
				}
				if (identicalBranches(node)) {
					context.report({ node, messageId: 'identicalBranches' });
					if (node.alternate) {
						context.report({ node: node.alternate, messageId: 'identicalBranches' });
					} else {
						for (const statement of statementsAfter(node)) {
							context.report({ node: statement, messageId: 'identicalBranches' });
						}
					}
				}
			},
			ConditionalExpression(node) {
				if (ternaryNullishOr(node) || identicalExpressions(node.consequent, node.alternate)) {
					context.report({
						node,
						messageId: ternaryNullishOr(node) ? 'alwaysTrue' : 'identicalBranches'
					});
				}
			}
		};
	}
};

/**
 * @param {any} node
 */
function isTrueLiteral(node) {
	const value = unwrap(node);
	return Boolean(value && value.type === 'Literal' && value.value === true);
}

/**
 * `height !== undefined || width !== undefined` is true once either measurement
 * has been written. It exists to subscribe, not to choose a path.
 *
 * @param {any} node
 */
function undefinedOrCount(node) {
	const value = unwrap(node);
	if (!value) return 0;
	if (value.type === 'LogicalExpression' && value.operator === '||') {
		return undefinedOrCount(value.left) + undefinedOrCount(value.right);
	}
	if (value.type !== 'BinaryExpression') return 0;
	if (value.operator !== '!==' && value.operator !== '!=') return 0;
	return isNullish(value.right) || isNullish(value.left) ? 1 : 0;
}

/**
 * @param {any} node
 */
function isAlwaysTrue(node) {
	const value = unwrap(node);
	if (!value) return false;
	if (isTrueLiteral(value)) return true;
	if (value.type === 'LogicalExpression' && value.operator === '||') {
		if (isTrueLiteral(value.left) || isTrueLiteral(value.right)) return true;
		if (undefinedOrCount(value) >= 2) return true;
		const left = unwrap(value.left);
		const right = unwrap(value.right);
		if (
			left &&
			right &&
			left.type === 'UnaryExpression' &&
			left.operator === '!' &&
			sameCode(left.argument, right)
		) {
			return true;
		}
		if (
			right &&
			left &&
			right.type === 'UnaryExpression' &&
			right.operator === '!' &&
			sameCode(right.argument, left)
		) {
			return true;
		}
	}
	if (value.type === 'LogicalExpression' && value.operator === '&&') {
		// One always-true arm still forces the read (`flag && (a !== undefined || b !== undefined)`).
		// `flag && !(a == null && b == null)` is the same subscription.
		// An early return of two `=== undefined` checks is a real guard and stays legal.
		return (
			isNegatedNullishAnd(value.left) ||
			isNegatedNullishAnd(value.right) ||
			isAlwaysTrue(value.left) ||
			isAlwaysTrue(value.right)
		);
	}
	return false;
}

/**
 * @param {any} node
 */
function inequalityCount(node) {
	const value = unwrap(node);
	if (!value) return 0;
	if (value.type === 'LogicalExpression' && value.operator === '||') {
		return inequalityCount(value.left) + inequalityCount(value.right);
	}
	if (value.type === 'BinaryExpression' && (value.operator === '!==' || value.operator === '!=')) {
		return 1;
	}
	return 0;
}

/**
 * @param {any} node
 */
function isOnlyReturn(node) {
	if (!node) return false;
	if (node.type === 'ReturnStatement') return true;
	if (node.type !== 'BlockStatement') return false;
	return node.body.length === 1 && node.body[0]?.type === 'ReturnStatement';
}

/**
 * Both arms are `untrack` callbacks that call the same helpers, so the
 * condition only subscribes. A returned `untrack` makes one following
 * `untrack` the other arm.
 *
 * @param {any} node
 */
function identicalBranches(node) {
	const left = untrackCalls(node.consequent);
	if (!left || left.length === 0) return false;
	const right = node.alternate ? untrackCalls(node.alternate) : untrackAfter(node);
	if (!right || right.length === 0) return false;
	return unique(left) === unique(right);
}

/**
 * @param {any} node
 * @returns {string[] | null}
 */
function untrackCalls(node) {
	if (!node) return null;
	const statements =
		node.type === 'BlockStatement'
			? node.body.filter((statement) => statement.type !== 'ReturnStatement')
			: [node];
	if (statements.length !== 1) return null;
	const statement = statements[0];
	const expr =
		statement.type === 'ExpressionStatement' ? unwrap(statement.expression) : unwrap(statement);
	if (!expr || expr.type !== 'CallExpression' || calleeName(expr.callee) !== 'untrack') return null;
	const callback = unwrap(expr.arguments?.[0]);
	if (
		!callback ||
		(callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression')
	) {
		return null;
	}
	/** @type {string[]} */
	const names = [];
	walkCalls(callback.body, names, true);
	return names;
}

/**
 * @param {any} node
 * @returns {string[] | null}
 */
function untrackAfter(node) {
	const rest = statementsAfter(node);
	if (rest.length !== 1) return null;
	return untrackCalls(rest[0]);
}

/**
 * @param {any} node
 */
function statementsAfter(node) {
	const parent = node.parent;
	if (!parent || parent.type !== 'BlockStatement') return [];
	const body = parent.body ?? [];
	const index = body.indexOf(node);
	if (index < 0) return [];
	return body.slice(index + 1);
}

/**
 * @param {any} node
 * @param {string[]} names
 * @param {boolean} enterFunctions
 */
function walkCalls(node, names, enterFunctions) {
	if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
	if (
		!enterFunctions &&
		(node.type === 'FunctionExpression' ||
			node.type === 'ArrowFunctionExpression' ||
			node.type === 'FunctionDeclaration')
	) {
		return;
	}
	if (node.type === 'IfStatement') {
		walkCalls(node.consequent, names, enterFunctions);
		walkCalls(node.alternate, names, enterFunctions);
		return;
	}
	if (node.type === 'CallExpression') {
		const name = calleeName(node.callee);
		if (name === 'untrack') {
			const callback = unwrap(node.arguments?.[0]);
			if (
				callback &&
				(callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression')
			) {
				walkCalls(callback.body, names, true);
			}
			return;
		}
		if (name) names.push(name);
	}
	for (const key of Object.keys(node)) {
		if (key === 'parent') continue;
		const child = node[key];
		if (Array.isArray(child)) {
			for (const item of child) walkCalls(item, names, enterFunctions);
		} else {
			walkCalls(child, names, enterFunctions);
		}
	}
}

/**
 * @param {string[]} names
 */
function unique(names) {
	return [...new Set(names)].sort().join(',');
}

/**
 * @param {any} left
 * @param {any} right
 */
function sameCode(left, right) {
	const a = unwrap(left);
	const b = unwrap(right);
	if (!a || !b || a.type !== b.type) return false;
	if (a.type === 'Identifier') return a.name === b.name;
	return false;
}

/**
 * @param {any} node
 */
function isNullish(node) {
	const value = unwrap(node);
	if (!value) return false;
	if (value.type === 'Literal') return value.value === null;
	if (value.type === 'Identifier') return value.name === 'undefined' || value.name === 'null';
	return false;
}

/**
 * @param {any} node
 */
function isNegatedNullishAnd(node) {
	const value = unwrap(node);
	return Boolean(
		value &&
		value.type === 'UnaryExpression' &&
		value.operator === '!' &&
		nullishAndCount(value.argument) >= 2
	);
}

/**
 * @param {any} node
 */
function nullishAndCount(node) {
	const value = unwrap(node);
	if (!value) return 0;
	if (value.type === 'LogicalExpression' && value.operator === '&&') {
		return nullishAndCount(value.left) + nullishAndCount(value.right);
	}
	if (value.type !== 'BinaryExpression') return 0;
	if (
		value.operator !== '===' &&
		value.operator !== '==' &&
		value.operator !== '!==' &&
		value.operator !== '!='
	) {
		return 0;
	}
	return isNullish(value.left) || isNullish(value.right) ? 1 : 0;
}

/**
 * Outside an effect, `a != null || b != null` that then uses `a` and `b` is a
 * condition. The same shape with unused operands only subscribes.
 *
 * @param {any} node
 */
function realOrOutsideEffect(node) {
	if (insideEffectNode(node)) return false;
	const names = comparedNames(node.test);
	if (names.size < 2) return false;
	const regions = [node.consequent, node.alternate, ...statementsAfter(node)].filter(Boolean);
	for (const name of names) {
		let used = false;
		for (const region of regions) {
			if (mentions(region, name)) used = true;
		}
		if (!used) return false;
	}
	return true;
}

/**
 * @param {any} node
 */
function insideEffectNode(node) {
	let current = node?.parent;
	while (current) {
		if (current.type === 'CallExpression' && effectCallback(current)) return true;
		current = current.parent;
	}
	return false;
}

/**
 * @param {any} node
 * @param {Set<string>} [names]
 */
function comparedNames(node, names = new Set()) {
	const value = unwrap(node);
	if (!value) return names;
	if (value.type === 'LogicalExpression') {
		comparedNames(value.left, names);
		comparedNames(value.right, names);
		return names;
	}
	if (value.type === 'UnaryExpression' && value.operator === '!') {
		comparedNames(value.argument, names);
		return names;
	}
	if (
		value.type === 'BinaryExpression' &&
		(isNullish(value.left) || isNullish(value.right)) &&
		isNullish(value.left) !== isNullish(value.right)
	) {
		const id = unwrap(isNullish(value.left) ? value.right : value.left);
		if (id?.type === 'Identifier') names.add(id.name);
	}
	return names;
}

/**
 * @param {any} node
 * @param {string} name
 */
function mentions(node, name) {
	let found = false;
	walk(node, (child) => {
		if (child.type !== 'Identifier' || child.name !== name) return;
		const parent = child.parent;
		if (
			(parent?.type === 'MemberExpression' || parent?.type === 'OptionalMemberExpression') &&
			parent.property === child &&
			!parent.computed
		) {
			return;
		}
		found = true;
	});
	return found;
}

/**
 * `a != null ? true : b != null` is `a != null || b != null`.
 *
 * @param {any} node
 */
function ternaryNullishOr(node) {
	const test = unwrap(node.test);
	const cons = unwrap(node.consequent);
	const alt = unwrap(node.alternate);
	if (!isNullishInequality(test)) return false;
	if (isTrueLiteral(cons) && isNullishInequality(alt)) return true;
	if (isNullishInequality(cons) && isTrueLiteral(alt)) return true;
	return false;
}

/**
 * @param {any} node
 */
function isNullishInequality(node) {
	const value = unwrap(node);
	if (!value || value.type !== 'BinaryExpression') return false;
	if (value.operator !== '!=' && value.operator !== '!==') return false;
	return isNullish(value.left) || isNullish(value.right);
}

/**
 * @param {any} left
 * @param {any} right
 */
function identicalExpressions(left, right) {
	const a = untrackCalls(left);
	const b = untrackCalls(right);
	if (!a || !b || a.length === 0 || b.length === 0) return false;
	return unique(a) === unique(b);
}

/**
 * @param {any} call
 * @param {Map<string, any[]>} fns
 * @param {Map<string, { source: string, imported: string }>} imports
 * @param {string} filename
 * @param {import('eslint').Rule.RuleContext} context
 */
function reportUnreadObjectProps(call, fns, imports, filename, context) {
	const callee = unwrap(call.callee);
	if (!callee || callee.type !== 'Identifier') return;
	const name = callee.name;
	const bodies = resolveCallees(name, fns, imports, filename);
	if (bodies.length === 0) return;
	const keySets = bodies.map((fn) => keysRead(fn));
	if (keySets.some((keys) => keys == null)) return;
	for (const argument of call.arguments ?? []) {
		const object = objectFromArgument(argument);
		if (!object) continue;
		for (const prop of object.properties ?? []) {
			if (prop.type !== 'Property' || prop.computed || prop.kind === 'get' || prop.kind === 'set')
				continue;
			const key =
				nameOf(prop.key) ?? (prop.key?.type === 'Literal' ? String(prop.key.value) : null);
			if (!key || !signalValue(prop.value)) continue;
			if (keySets.every((keys) => keys && !keys.has(key))) {
				context.report({ node: prop.value, messageId: 'voidSignal' });
			}
		}
	}
}

/**
 * @param {string} name
 * @param {Map<string, any[]>} fns
 * @param {Map<string, { source: string, imported: string }>} imports
 * @param {string} filename
 */
function resolveCallees(name, fns, imports, filename) {
	const imported = imports.get(name);
	if (imported) {
		const fn = loadNamedFunction(filename, imported.source, imported.imported);
		return fn ? [fn] : [];
	}
	return fns.get(name) ?? [];
}

/**
 * Keys read from the object a single callback parameter returns.
 * `null` means the object escapes and every key counts as read.
 *
 * @param {any} fn
 * @returns {Set<string> | null}
 */
function keysRead(fn) {
	if (!fn || (fn.params?.length ?? 0) !== 1) return null;
	const param = parameterName(fn.params[0]);
	if (!param) return null;
	/** @type {Set<string>} */
	const keys = new Set();
	/** @type {Set<string>} */
	const aliases = new Set();
	const refs = valueReferences(fn, param);
	if (refs.length === 0) return keys;
	for (const ref of refs) {
		const parent = ref.parent;
		if (parent?.type !== 'CallExpression' || parent.callee !== ref || parent.arguments?.length) {
			return null;
		}
		const declarator = parent.parent;
		if (declarator?.type !== 'VariableDeclarator' || declarator.init !== parent) return null;
		if (declarator.id?.type === 'Identifier') {
			aliases.add(declarator.id.name);
			continue;
		}
		if (declarator.id?.type === 'ObjectPattern') {
			if (!addPatternKeys(declarator.id, keys)) return null;
			continue;
		}
		return null;
	}
	const pending = [...aliases];
	for (const alias of pending) {
		if (!followAlias(fn, alias, keys, pending)) return null;
	}
	return keys;
}

/**
 * @param {any} fn
 * @param {string} alias
 * @param {Set<string>} keys
 * @param {string[]} pending
 */
function followAlias(fn, alias, keys, pending) {
	for (const ref of valueReferences(fn, alias)) {
		const parent = ref.parent;
		if (!parent) return false;
		if (
			(parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression') &&
			parent.object === ref &&
			!parent.computed
		) {
			const key = nameOf(parent.property);
			if (!key) return false;
			keys.add(key);
			continue;
		}
		if (parent.type === 'VariableDeclarator' && parent.init === ref) {
			if (parent.id?.type === 'Identifier') {
				if (!pending.includes(parent.id.name)) pending.push(parent.id.name);
				continue;
			}
			if (parent.id?.type === 'ObjectPattern') {
				if (!addPatternKeys(parent.id, keys)) return false;
				continue;
			}
			return false;
		}
		return false;
	}
	return true;
}

/**
 * @param {any} pattern
 * @param {Set<string>} keys
 */
function addPatternKeys(pattern, keys) {
	for (const prop of pattern.properties ?? []) {
		if (prop.type === 'RestElement') return false;
		if (prop.type !== 'Property' || prop.computed) return false;
		const key = nameOf(prop.key) ?? (prop.key?.type === 'Literal' ? String(prop.key.value) : null);
		if (!key) return false;
		keys.add(key);
	}
	return true;
}

/**
 * @param {any} argument
 */
function objectFromArgument(argument) {
	const value = unwrap(argument);
	if (!value) return null;
	if (value.type === 'ObjectExpression') return value;
	if (value.type !== 'ArrowFunctionExpression' && value.type !== 'FunctionExpression') return null;
	const body = unwrap(value.body);
	if (body?.type === 'ObjectExpression') return body;
	if (body?.type !== 'BlockStatement' || body.body?.length !== 1) return null;
	const only = body.body[0];
	if (only.type !== 'ReturnStatement') return null;
	const returned = unwrap(only.argument);
	return returned?.type === 'ObjectExpression' ? returned : null;
}

/**
 * @param {any} node
 */
function signalValue(node) {
	const value = unwrap(node);
	if (!value) return false;
	if (value.type === 'Identifier') return value.name !== 'undefined';
	if (value.type === 'MemberExpression' || value.type === 'OptionalMemberExpression') return true;
	if (value.type === 'LogicalExpression' || value.type === 'ConditionalExpression') {
		return (
			signalValue(value.left ?? value.test) ||
			signalValue(value.right ?? value.consequent) ||
			signalValue(value.alternate)
		);
	}
	if (value.type === 'UnaryExpression' && value.operator !== 'void')
		return signalValue(value.argument);
	return false;
}

export default rule;
