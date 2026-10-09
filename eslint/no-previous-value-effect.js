/**
 * Reject an effect that compares a value against the copy it stored on its
 * previous run. The variable name is irrelevant. Run the side effect on the
 * path that commits the value.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript-eslint';
import {
	effectCallback,
	functionsByName,
	localCallees,
	nameOf,
	unwrap,
	walk,
	walkOwn
} from './effects.js';

const COMPARE = new Set(['===', '==', '!==', '!=']);

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow effects that diff a previous value to fire a change. Run the side effect on the commit path.'
		},
		schema: [],
		messages: {
			previousValue:
				'Do not watch a previous value inside `$effect` to fire a change. Run the side effect on the path that commits the value.'
		}
	},
	create(context) {
		const fns = functionsByName(context.sourceCode.ast);

		/**
		 * @param {any} node
		 * @returns {string | null}
		 */
		function pathOf(node) {
			const value = unwrap(node);
			if (!value) return null;
			if (value.type === 'Identifier') return nameOf(value);
			if (value.type === 'ThisExpression') return 'this';
			if (value.type === 'MemberExpression' && !value.computed) {
				const objectPath = pathOf(value.object);
				const property = nameOf(value.property);
				if (objectPath && property) return `${objectPath}.${property}`;
			}
			return null;
		}

		/**
		 * @param {any} node
		 */
		function isLiteralish(node) {
			const value = unwrap(node);
			if (!value) return false;
			if (value.type === 'Literal') return true;
			if (value.type === 'TemplateLiteral' && value.expressions?.length === 0) return true;
			if (
				value.type === 'Identifier' &&
				(value.name === 'undefined' || value.name === 'NaN' || value.name === 'Infinity')
			) {
				return true;
			}
			if (
				value.type === 'UnaryExpression' &&
				(value.operator === '-' || value.operator === '+') &&
				value.argument?.type === 'Literal'
			) {
				return true;
			}
			return false;
		}

		/**
		 * @param {any} fn
		 * @param {Set<any>} reported
		 */
		function reportStoredComparisons(fn, reported, at) {
			/** @type {Map<string, any>} */
			const assigned = new Map();
			/** @type {Set<string>} */
			const armed = new Set();
			/** @type {Map<string, string>} */
			const aliases = new Map();
			const body = fn.body ?? fn;

			walkOwn(body, (node) => {
				if (node.type !== 'AssignmentExpression' || node.operator !== '=') return;
				const key = pathOf(node.left);
				if (!key) return;
				const ownsSlot = node.left.type === 'Identifier' || key.startsWith('this.');
				if (!ownsSlot) return;
				const right = unwrap(node.right);
				if (right && !isLiteralish(right)) assigned.set(key, node.left);
				if (right?.type === 'Literal' && right.value === true && node.left.type === 'Identifier') {
					armed.add(node.left.name);
				}
			});

			walkOwn(body, (node) => {
				if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier') return;
				const init = unwrap(node.init);
				if (!init) return;
				if (init.type === 'Identifier') {
					if (assigned.has(init.name)) aliases.set(node.id.name, init.name);
					return;
				}
				const stored = storedKey(pathOf(init));
				if (stored) aliases.set(node.id.name, stored);
			});

			/**
			 * @param {any} expr
			 * @returns {string | null}
			 */
			function resolve(expr) {
				const value = unwrap(expr);
				if (!value) return null;
				if (value.type === 'Identifier') return aliases.get(value.name) ?? value.name;
				return pathOf(value);
			}

			/**
			 * @param {string | null} key
			 */
			function storedKey(key) {
				if (!key) return null;
				if (assigned.has(key)) return key;
				for (const candidate of assigned.keys()) {
					if (key.startsWith(`${candidate}.`)) return candidate;
				}
				return null;
			}

			/**
			 * @param {any} left
			 * @param {any} right
			 */
			function noteComparison(left, right) {
				if (isLiteralish(left) || isLiteralish(right)) return;
				for (const expr of [left, right]) {
					const key = storedKey(resolve(expr));
					if (!key) continue;
					const target = assigned.get(key);
					if (target && !reported.has(at ?? target)) {
						reported.add(at ?? target);
						context.report({ node: at ?? target, messageId: 'previousValue' });
					}
				}
			}

			/**
			 * A helper call in a condition (`areArraysEqual(prev, next)`) is the same diff.
			 * @param {any} test
			 */
			function noteHelperCondition(test) {
				const value = unwrap(test);
				if (!value) return;
				if (
					value.type === 'UnaryExpression' &&
					(value.operator === '!' || value.operator === '!!')
				) {
					noteHelperCondition(value.argument);
					return;
				}
				if (value.type === 'LogicalExpression') {
					noteHelperCondition(value.left);
					noteHelperCondition(value.right);
					return;
				}
				if (value.type !== 'CallExpression' || (value.arguments?.length ?? 0) < 2) return;
				/** @type {string[]} */
				const keys = [];
				let other = false;
				for (const arg of value.arguments) {
					const key = storedKey(resolve(arg));
					if (key) keys.push(key);
					else if (!isLiteralish(arg)) other = true;
				}
				if (!other || !keys.some((key) => key.startsWith('this.'))) return;
				for (const key of keys) {
					if (!key.startsWith('this.')) continue;
					const target = assigned.get(key);
					if (target && !reported.has(at ?? target)) {
						reported.add(at ?? target);
						context.report({ node: at ?? target, messageId: 'previousValue' });
					}
				}
			}

			/** @type {Map<string, any[]>} */
			const diffFlags = new Map();
			walkOwn(body, (node) => {
				if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier' || !node.init)
					return;
				const init = unwrap(node.init);
				if (!init) return;
				/** @type {any[]} */
				const targets = [];
				const noteStored = (expr) => {
					const key = storedKey(resolve(expr));
					const target = key ? assigned.get(key) : undefined;
					if (target) targets.push(target);
				};
				if (init.type === 'BinaryExpression' && COMPARE.has(init.operator)) {
					noteStored(init.left);
					noteStored(init.right);
				}
				if (init.type === 'CallExpression') {
					for (const arg of init.arguments ?? []) noteStored(arg);
				}
				if (targets.length > 0) diffFlags.set(node.id.name, targets);
			});

			/**
			 * @param {any} test
			 */
			function reportFlag(test) {
				const value = unwrap(test);
				const name = value?.type === 'Identifier' ? value.name : null;
				if (!name) return;
				for (const target of diffFlags.get(name) ?? []) {
					const where = at ?? target;
					if (reported.has(where)) continue;
					reported.add(where);
					context.report({ node: where, messageId: 'previousValue' });
				}
			}

			walkOwn(body, (node) => {
				if (node.type === 'BinaryExpression' && COMPARE.has(node.operator)) {
					noteComparison(node.left, node.right);
				}
				if (node.type === 'CallExpression') {
					const callee = unwrap(node.callee);
					const isObjectIs =
						callee?.type === 'MemberExpression' &&
						!callee.computed &&
						nameOf(callee.object) === 'Object' &&
						nameOf(callee.property) === 'is';
					if (isObjectIs && node.arguments?.length >= 2) {
						noteComparison(node.arguments[0], node.arguments[1]);
					}
				}
				if (node.type === 'IfStatement') {
					noteHelperCondition(node.test);
					reportFlag(node.test);
				}
				if (node.type === 'SwitchStatement') reportFlag(node.discriminant);
				if (node.type === 'ConditionalExpression') noteHelperCondition(node.test);
				if (node.type !== 'IfStatement' || !returnsImmediately(node.consequent)) return;
				const flag = negatedIdentifier(node.test);
				const where = at ?? flag;
				if (!flag || !armed.has(flag.name) || reported.has(where)) return;
				reported.add(where);
				context.report({ node: where, messageId: 'previousValue' });
			});
		}

		/**
		 * @param {any} node
		 */
		function returnsImmediately(node) {
			if (!node) return false;
			if (node.type === 'ReturnStatement') return true;
			if (node.type !== 'BlockStatement') return false;
			return node.body?.some((statement) => statement.type === 'ReturnStatement') === true;
		}

		/**
		 * @param {any} node
		 * @returns {any}
		 */
		function negatedIdentifier(node) {
			const value = unwrap(node);
			if (!value) return null;
			if (
				value.type === 'UnaryExpression' &&
				value.operator === '!' &&
				value.argument?.type === 'Identifier'
			) {
				return value.argument;
			}
			if (value.type === 'LogicalExpression') {
				return negatedIdentifier(value.left) ?? negatedIdentifier(value.right);
			}
			return null;
		}

		/**
		 * @param {string} specifier
		 * @param {string} fromFile
		 */
		function resolveModule(specifier, fromFile) {
			/** @type {string | null} */
			let base = null;
			if (specifier.startsWith('.')) {
				base = path.resolve(path.dirname(fromFile), specifier);
			} else if (specifier.startsWith('$lib/') || specifier.startsWith('#lib/')) {
				const cwd = typeof context.cwd === 'string' ? context.cwd : process.cwd();
				base = path.resolve(cwd, 'src/lib', specifier.replace(/^(\$lib|#lib)\//, ''));
			}
			if (!base) return null;
			const candidates = [
				base,
				`${base}.ts`,
				`${base}.svelte.ts`,
				base.replace(/\.js$/, '.ts'),
				base.replace(/\.svelte\.js$/, '.svelte.ts')
			];
			return candidates.find((candidate) => existsSync(candidate)) ?? null;
		}

		/**
		 * @param {any} fn
		 * @returns {string | null}
		 */
		/**
		 * @param {any} node
		 * @returns {string | null}
		 */
		/**
		 * A module function that remembers a parameter and compares the next call
		 * with it. A DOM walk that assigns a cursor and compares it with a parent
		 * does not write that parameter back.
		 * @param {any} fn
		 */
		function storesParameter(fn) {
			/** @type {Set<string>} */
			const params = new Set(
				(fn.params ?? []).map((param) => nameOf(unwrap(param))).filter((name) => name)
			);
			/** @type {Set<string>} */
			const compared = new Set();
			/** @type {Set<string>} */
			const written = new Set();
			walkOwn(fn.body ?? fn, (node) => {
				if (node.type === 'AssignmentExpression') {
					const key = pathOf(node.left);
					const right = nameOf(unwrap(node.right));
					if (key && right && params.has(right)) written.add(key);
				}
				if (node.type === 'BinaryExpression' && COMPARE.has(node.operator)) {
					const leftName = nameOf(unwrap(node.left));
					const rightName = nameOf(unwrap(node.right));
					if (leftName && params.has(leftName)) {
						const key = pathOf(node.right);
						if (key) compared.add(key);
					}
					if (rightName && params.has(rightName)) {
						const key = pathOf(node.left);
						if (key) compared.add(key);
					}
				}
			});
			for (const key of compared) {
				if (written.has(key)) return true;
			}
			return false;
		}

		function typeName(node) {
			const value = unwrap(node);
			if (!value) return null;
			if (value.type === 'Identifier') return value.name;
			if (value.type === 'TSTypeReference') return typeName(value.typeName);
			return null;
		}

		function returnedModelName(fn) {
			let found = null;
			walkOwn(fn.body ?? fn, (node) => {
				if (found || node.type !== 'ReturnStatement' || !node.argument) return;
				const value = unwrap(node.argument);
				if (!value) return;
				if (value.type === 'NewExpression') {
					found = nameOf(value.callee);
					return;
				}
				if (value.type === 'Identifier') {
					found = value.name;
					return;
				}
				if (value.type !== 'CallExpression') return;
				const types = value.typeArguments?.params ?? value.typeParameters?.params ?? [];
				const named = types.map((param) => typeName(param)).find((name) => name);
				if (named) found = named;
			});
			return found;
		}

		/** @type {Map<string, any>} */
		const foreignAst = new Map();

		/**
		 * @param {string} file
		 */
		function parsedFile(file) {
			if (foreignAst.has(file)) return foreignAst.get(file);
			let ast;
			try {
				ast = ts.parser.parseForESLint(readFileSync(file, 'utf8'), {
					ecmaVersion: 'latest',
					sourceType: 'module',
					filePath: file
				}).ast;
			} catch {
				ast = undefined;
			}
			foreignAst.set(file, ast);
			return ast;
		}

		/**
		 * @param {string} file
		 */
		function foreignFunctions(file) {
			const ast = parsedFile(file);
			return ast ? functionsByName(ast) : new Map();
		}

		/**
		 * @param {string} file
		 * @param {string} name
		 */
		function importedFile(file, name) {
			const ast = parsedFile(file);
			if (!ast) return null;
			/** @type {string | null} */
			let found = null;
			walk(ast, (node) => {
				if (found || node.type !== 'ImportDeclaration' || typeof node.source?.value !== 'string') {
					return;
				}
				for (const spec of node.specifiers ?? []) {
					const local = nameOf(spec.local);
					const imported =
						spec.type === 'ImportSpecifier' ? (nameOf(spec.imported) ?? local) : local;
					if (local !== name && imported !== name) continue;
					found = resolveModule(node.source.value, file);
				}
			});
			return found;
		}

		/**
		 * The method the effect actually calls, including one defined in an import.
		 * A same-named function in this file is not that method.
		 * @param {any} fn
		 */
		function importedMethods(fn) {
			const filename = context.filename;
			if (!filename || filename === '<input>') return [];
			const fromFile = path.isAbsolute(filename) ? filename : path.resolve(filename);
			/** @type {Map<string, { file: string, imported: string }>} */
			const imports = new Map();
			walk(context.sourceCode.ast, (node) => {
				if (node.type !== 'ImportDeclaration' || typeof node.source?.value !== 'string') return;
				const file = resolveModule(node.source.value, fromFile);
				if (!file) return;
				for (const spec of node.specifiers ?? []) {
					if (spec.type !== 'ImportSpecifier' && spec.type !== 'ImportDefaultSpecifier') continue;
					const local = nameOf(spec.local);
					const imported =
						spec.type === 'ImportSpecifier' ? (nameOf(spec.imported) ?? local) : 'default';
					if (local && imported) imports.set(local, { file, imported });
				}
			});
			/** @type {Map<string, string>} */
			const instances = new Map();
			walk(context.sourceCode.ast, (node) => {
				if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier') return;
				const init = unwrap(node.init);
				if (!init) return;
				if (init.type === 'NewExpression') {
					const ctor = nameOf(init.callee);
					if (ctor) instances.set(node.id.name, ctor);
					return;
				}
				if (init.type !== 'CallExpression') return;
				const factory = nameOf(unwrap(init.callee));
				const importedFactory = factory ? imports.get(factory) : undefined;
				if (!importedFactory) return;
				const modelName = (
					foreignFunctions(importedFactory.file).get(importedFactory.imported) ?? []
				)
					.map((factoryFn) => returnedModelName(factoryFn))
					.find((name) => name);
				if (!modelName) return;
				const definedHere =
					(foreignFunctions(importedFactory.file).get(modelName) ?? []).length > 0;
				const modelFile = definedHere
					? importedFactory.file
					: importedFile(importedFactory.file, modelName);
				if (modelFile) instances.set(node.id.name, `${modelFile}#${modelName}`);
			});
			/** @type {{ fn: any, call: any }[]} */
			const found = [];
			/**
			 * @param {string} ctor
			 * @param {string} method
			 * @param {any} call
			 */
			function takeMethod(ctor, method, call) {
				const located = ctor.includes('#')
					? { file: ctor.slice(0, ctor.indexOf('#')), imported: ctor.slice(ctor.indexOf('#') + 1) }
					: imports.get(ctor);
				if (!located || located.imported === 'default') return;
				const methods = foreignFunctions(located.file).get(method) ?? [];
				for (const methodFn of methods) {
					if (methodFn !== fn) found.push({ fn: methodFn, call });
				}
			}
			walk(fn.body ?? fn, (node) => {
				if (node.type !== 'CallExpression') return;
				if (node.callee?.type === 'Identifier') {
					const imported = imports.get(node.callee.name);
					if (!imported || imported.imported === 'default') return;
					const fns = foreignFunctions(imported.file).get(imported.imported) ?? [];
					for (const foreign of fns) {
						if (foreign !== fn && storesParameter(foreign)) found.push({ fn: foreign, call: node });
					}
					return;
				}
				if (node.callee?.type !== 'MemberExpression') return;
				const objectName = nameOf(node.callee.object);
				const method = nameOf(node.callee.property);
				if (!objectName || !method) return;
				const ctor = instances.get(objectName);
				if (ctor) takeMethod(ctor, method, node);
			});
			return found;
		}

		return {
			CallExpression(node) {
				const fn = effectCallback(node);
				if (!fn) return;
				const reported = new Set();
				reportStoredComparisons(fn, reported);
				for (const callee of localCallees(fn, fns)) {
					reportStoredComparisons(callee, reported);
				}
				for (const callee of importedMethods(fn)) {
					reportStoredComparisons(callee.fn, reported, callee.call);
				}
			}
		};
	}
};

export default rule;
