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
	functionsByName,
	hasAncestor,
	insideUntrack,
	parameterName,
	unwrap,
	valueReferences
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
				'Do not force a signal read with `void`. Pass the value into the function that uses it, or read it in a `$derived`.'
		}
	},
	create(context) {
		const fns = functionsByName(context.sourceCode.ast);
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
				if (insideEffect(node) || !insideFunction(node)) {
					context.report({ node, messageId: 'voidSignal' });
				}
			},
			ExpressionStatement(node) {
				if (!insideEffect(node)) return;
				const expr = unwrap(node.expression);
				if (!expr || expr.type === 'UnaryExpression') return;
				if (expr.type === 'Identifier' || expr.type === 'MemberExpression') {
					context.report({ node, messageId: 'voidSignal' });
				}
			},
			CallExpression(node) {
				if (!insideEffect(node) && insideFunction(node)) return;
				if (!insideEffect(node) && node.parent?.type !== 'ExpressionStatement') return;
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
				if (effectFunction(node) && refs.length === 0 && signalInit) {
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
			}
		};
	}
};

export default rule;
