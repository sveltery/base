/**
 * Shared helpers live in one module. A second function, class, or type alias
 * with the same name is rejected. So is a renamed copy whose normalized body
 * matches the owner, an `export { x as y }` alias of a registered name, and a
 * type alias whose right-hand side matches the owner.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import { nameOf, unwrap } from './effects.js';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

/** @type {Record<string, string>} */
const OWNERS = {
	toCssStyle: 'src/lib/internal/css-style.ts',
	mergeCssStyle: 'src/lib/internal/css-style.ts',
	chain: 'src/lib/internal/mergeProps.ts',
	mergeClass: 'src/lib/internal/mergeProps.ts',
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
	PopoverHandle: 'src/lib/popover/handle.svelte.ts',
	registerLabelElementId: 'src/lib/internal/popups/labelId.ts',
	stopEvent: 'src/lib/internal/floating-ui-react/utils/event.ts',
	registerLabelId: 'src/lib/internal/register-label-id.svelte.ts',
	isSkipped: 'src/lib/internal/composite-skip.ts',
	CompositeRoot: 'src/lib/internal/composite-root.svelte.ts',
	PartRender: 'src/lib/internal/render-children.ts',
	TextDirection: 'src/lib/direction-provider/types.ts'
};

const PARSE_OPTIONS = {
	ecmaVersion: 'latest',
	sourceType: 'module',
	loc: false,
	range: false,
	comment: false,
	tokens: false
};

/**
 * @param {string} code
 */
function parse(code) {
	return ts.parser.parseForESLint(code, PARSE_OPTIONS).ast;
}

const SKIP_KEYS = new Set([
	'parent',
	'loc',
	'range',
	'start',
	'end',
	'comments',
	'leadingComments',
	'trailingComments',
	'innerComments',
	'tokens'
]);

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
		(value.type === 'FunctionDeclaration' ||
			value.type === 'ClassDeclaration' ||
			value.type === 'TSTypeAliasDeclaration') &&
		value.id &&
		typeof value.id.name === 'string'
	) {
		return OWNERS[value.id.name] ? value.id.name : null;
	}
	if (value.type !== 'VariableDeclarator' || value.id?.type !== 'Identifier') return null;
	if (!OWNERS[value.id.name] || value.init == null) return null;
	return value.id.name;
}

/**
 * @param {string} name
 * @param {Map<string, string>} bindings
 */
function bind(name, bindings) {
	if (!bindings.has(name)) bindings.set(name, '#' + bindings.size);
}

/**
 * @param {any} pattern
 * @param {Map<string, string>} bindings
 */
function bindPattern(pattern, bindings) {
	if (!pattern) return;
	switch (pattern.type) {
		case 'Identifier':
			bind(pattern.name, bindings);
			break;
		case 'AssignmentPattern':
			bindPattern(pattern.left, bindings);
			break;
		case 'RestElement':
			bindPattern(pattern.argument, bindings);
			break;
		case 'ObjectPattern':
			for (const prop of pattern.properties ?? []) {
				if (prop.type === 'RestElement') bindPattern(prop.argument, bindings);
				else bindPattern(prop.value, bindings);
			}
			break;
		case 'ArrayPattern':
			for (const element of pattern.elements ?? []) bindPattern(element, bindings);
			break;
		case 'TSParameterProperty':
			bindPattern(pattern.parameter, bindings);
			break;
		default:
			break;
	}
}

/**
 * @param {any} node
 * @param {Map<string, string>} bindings
 */
function walkBind(node, bindings) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		for (const item of node) walkBind(item, bindings);
		return;
	}
	if (typeof node.type !== 'string') return;

	if (node.type === 'TSTypeParameter' && node.name?.type === 'Identifier') {
		bind(node.name.name, bindings);
	}
	if (
		node.type === 'FunctionDeclaration' ||
		node.type === 'FunctionExpression' ||
		node.type === 'ArrowFunctionExpression'
	) {
		if (node.id?.type === 'Identifier') bind(node.id.name, bindings);
		for (const param of node.params ?? []) bindPattern(param, bindings);
	}
	if (
		(node.type === 'ClassDeclaration' || node.type === 'ClassExpression') &&
		node.id?.type === 'Identifier'
	) {
		bind(node.id.name, bindings);
	}
	if (node.type === 'TSTypeAliasDeclaration' && node.id?.type === 'Identifier') {
		bind(node.id.name, bindings);
	}
	if (node.type === 'VariableDeclarator') bindPattern(node.id, bindings);
	if (node.type === 'CatchClause') bindPattern(node.param, bindings);
	for (const param of node.typeParameters?.params ?? []) {
		if (param?.name?.type === 'Identifier') bind(param.name.name, bindings);
	}

	for (const key of Object.keys(node)) {
		if (SKIP_KEYS.has(key)) continue;
		walkBind(node[key], bindings);
	}
}

/**
 * @param {any} node
 */
function bindingsFor(node) {
	/** @type {Map<string, string>} */
	const bindings = new Map();
	if (
		node?.id?.type === 'Identifier' &&
		(node.type === 'FunctionDeclaration' ||
			node.type === 'FunctionExpression' ||
			node.type === 'ClassDeclaration' ||
			node.type === 'ClassExpression' ||
			node.type === 'TSTypeAliasDeclaration' ||
			node.type === 'VariableDeclarator')
	) {
		bindings.set(node.id.name, '#self');
	}
	walkBind(node, bindings);
	return bindings;
}

/**
 * @param {any} parent
 * @param {string} key
 */
function isStructuralName(parent, key) {
	if (!parent || typeof parent !== 'object') return false;
	if (parent.type === 'MemberExpression' && key === 'property' && parent.computed !== true) {
		return true;
	}
	if (
		(parent.type === 'Property' ||
			parent.type === 'MethodDefinition' ||
			parent.type === 'PropertyDefinition' ||
			parent.type === 'TSPropertySignature' ||
			parent.type === 'TSMethodSignature' ||
			parent.type === 'TSEnumMember') &&
		key === 'key' &&
		parent.computed !== true
	) {
		return true;
	}
	return false;
}

/**
 * @param {any} node
 * @param {any} parent
 * @param {string | null} parentKey
 * @param {Map<string, string>} bindings
 */
function serialize(node, parent, parentKey, bindings) {
	if (node == null || typeof node !== 'object') return JSON.stringify(node);
	if (Array.isArray(node)) {
		return '[' + node.map((item) => serialize(item, parent, parentKey, bindings)).join(',') + ']';
	}
	if (node.type === 'Identifier') {
		const structural = isStructuralName(parent, parentKey ?? '');
		const name = !structural && bindings.has(node.name) ? bindings.get(node.name) : node.name;
		return JSON.stringify({ type: 'Identifier', name });
	}
	if (node.type === 'Literal') {
		return JSON.stringify({ type: 'Literal', value: node.value, regex: node.regex ?? null });
	}
	const keys = Object.keys(node)
		.filter((key) => !SKIP_KEYS.has(key) && node[key] !== undefined)
		.sort();
	return (
		'{' +
		keys
			.map((key) => JSON.stringify(key) + ':' + serialize(node[key], node, key, bindings))
			.join(',') +
		'}'
	);
}

/**
 * @param {any} node
 */
function canonicalNode(node) {
	if (!node) return null;
	if (node.type === 'VariableDeclarator') return canonicalNode(node.init);
	if (
		node.type === 'FunctionDeclaration' ||
		node.type === 'FunctionExpression' ||
		node.type === 'ArrowFunctionExpression'
	) {
		if (!node.body) return null;
		return {
			type: 'Function',
			async: Boolean(node.async),
			generator: Boolean(node.generator),
			params: node.params ?? [],
			body: node.body,
			typeParameters: node.typeParameters ?? null,
			returnType: node.returnType ?? null
		};
	}
	if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
		return {
			type: 'Class',
			superClass: node.superClass ?? null,
			superTypeArguments: node.superTypeArguments ?? null,
			body: node.body,
			typeParameters: node.typeParameters ?? null
		};
	}
	if (node.type === 'TSTypeAliasDeclaration') {
		return {
			type: 'TypeAlias',
			typeParameters: node.typeParameters ?? null,
			typeAnnotation: node.typeAnnotation ?? null
		};
	}
	return null;
}

/**
 * @param {any} node
 * @param {(node: any) => void} visit
 */
function walk(node, visit) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		for (const item of node) walk(item, visit);
		return;
	}
	if (typeof node.type !== 'string') return;
	visit(node);
	for (const key of Object.keys(node)) {
		if (SKIP_KEYS.has(key)) continue;
		walk(node[key], visit);
	}
}

/**
 * @param {any} ast
 * @param {string | null} name
 */
function findDeclaration(ast, name) {
	/** @type {any} */
	let found = null;
	walk(ast, (node) => {
		if (found) return;
		const declared =
			node.type === 'FunctionDeclaration' ||
			node.type === 'ClassDeclaration' ||
			node.type === 'TSTypeAliasDeclaration'
				? node.id?.name
				: node.type === 'VariableDeclarator' && node.id?.type === 'Identifier'
					? node.id.name
					: null;
		if (!declared) return;
		if (name != null && declared !== name) return;
		if (node.type === 'FunctionDeclaration' && node.body == null) return;
		if (!canonicalNode(node)) return;
		found = node;
	});
	return found;
}

/**
 * @param {any} declaration
 */
function printDeclaration(declaration) {
	const canonical = canonicalNode(declaration);
	if (!canonical) return null;
	return serialize(canonical, null, null, bindingsFor(declaration));
}

/** @type {Map<string, string> | null} */
let ownerPrints = null;

function ownerFingerprints() {
	if (ownerPrints) return ownerPrints;
	ownerPrints = new Map();
	/** @type {Map<string, any>} */
	const parsed = new Map();
	for (const owner of new Set(Object.values(OWNERS))) {
		const abs = path.join(repoRoot, owner);
		let code;
		try {
			code = fs.readFileSync(abs, 'utf8');
		} catch {
			continue;
		}
		try {
			parsed.set(owner, parse(code));
		} catch {
			continue;
		}
	}
	for (const [name, owner] of Object.entries(OWNERS)) {
		const ast = parsed.get(owner);
		if (!ast) continue;
		const declaration = findDeclaration(ast, name);
		if (!declaration) continue;
		const print = printDeclaration(declaration);
		if (print && !ownerPrints.has(print)) ownerPrints.set(print, name);
	}
	return ownerPrints;
}

/**
 * @param {import('eslint').SourceCode} sourceCode
 * @param {any} node
 */
function copiedByBody(sourceCode, node) {
	const value = unwrap(node);
	if (!value || !canonicalNode(value)) return null;
	let text;
	try {
		text =
			value.type === 'VariableDeclarator'
				? `const ${sourceCode.getText(value)};`
				: sourceCode.getText(value);
	} catch {
		return null;
	}
	let ast;
	try {
		ast = parse(text);
	} catch {
		return null;
	}
	const declaration = findDeclaration(ast, null);
	if (!declaration) return null;
	const print = printDeclaration(declaration);
	if (!print) return null;
	return ownerFingerprints().get(print) ?? null;
}

/**
 * @param {string} filename
 * @param {any} sourceNode
 * @param {string} owner
 */
function sourceIsOwner(filename, sourceNode, owner) {
	if (!sourceNode || sourceNode.type !== 'Literal' || typeof sourceNode.value !== 'string') {
		return false;
	}
	const specifier = sourceNode.value;
	if (!specifier.startsWith('.')) return false;
	const resolved = path.resolve(path.dirname(filename), specifier);
	const candidates = [resolved];
	if (resolved.endsWith('.js')) candidates.push(resolved.slice(0, -3) + '.ts');
	candidates.push(`${resolved}.ts`, `${resolved}.svelte.ts`);
	for (const candidate of candidates) {
		const normalized = candidate.replaceAll('\\', '/');
		if (normalized.endsWith(owner) && fs.existsSync(candidate)) return true;
	}
	return false;
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

		/**
		 * @param {any} node
		 * @param {string | null} name
		 */
		function reportCopy(node, name) {
			if (!name || isOwner(filename, OWNERS[name])) return;
			context.report({
				node,
				messageId: 'copiedHelper',
				data: { name, owner: OWNERS[name] }
			});
		}

		/**
		 * @param {any} node
		 */
		function checkDeclaration(node) {
			const named = declaredHelper(node);
			if (named) {
				reportCopy(node, named);
				return;
			}
			reportCopy(node, copiedByBody(context.sourceCode, node));
		}

		return {
			FunctionDeclaration: checkDeclaration,
			ClassDeclaration: checkDeclaration,
			VariableDeclarator: checkDeclaration,
			TSTypeAliasDeclaration: checkDeclaration,
			ExportNamedDeclaration(node) {
				for (const spec of node.specifiers ?? []) {
					if (spec.type !== 'ExportSpecifier') continue;
					const local = spec.local?.name;
					const exported = spec.exported?.name ?? spec.exported?.value;
					if (typeof local !== 'string' || typeof exported !== 'string') continue;
					if (local === exported) {
						if (!node.source || !OWNERS[exported]) continue;
						if (isOwner(filename, OWNERS[exported])) continue;
						if (sourceIsOwner(filename, node.source, OWNERS[exported])) continue;
						reportCopy(spec, exported);
						continue;
					}
					const name = OWNERS[exported] ? exported : OWNERS[local] ? local : null;
					if (!name || isOwner(filename, OWNERS[name])) continue;
					reportCopy(spec, name);
				}
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
