import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parse } from 'svelte/compiler';
import ts from 'typescript';

/** One row of a props or state table. */
export type ApiProp = {
	name: string;
	type: string;
	default?: string;
	description: string;
	bindable: boolean;
};

/** One exported part, such as `Collapsible.Trigger`. */
export type ApiPart = {
	/** The name a consumer writes, such as `Collapsible.Trigger` or `Button`. */
	name: string;
	/** The element the part renders, such as `<button>`, read from the component's header comment. */
	element?: string;
	description: string;
	props: ApiProp[];
	state: ApiProp[];
	/** Source files the reference was read from, for dev-server reloads. */
	files: string[];
};

/**
 * Reads the public parts of one library folder, such as `collapsible`, and their props and
 * state from the TypeScript types the components declare.
 */
export function apiReference(lib: string, folder: string): ApiPart[] {
	const index = join(lib, folder, 'index.ts');
	const program = createProgram(lib);
	const checker = program.getTypeChecker();
	const source = program.getSourceFile(index);
	if (!source) throw new Error(`${index} is not in the API program`);
	// A part can live in another folder, as `OTPField.Separator` does, so its types come from that folder's entry.
	const publicTypes = publicTypeNames(program, checker, lib);
	const exportedTypes = (file: string) => {
		const entry = program.getSourceFile(join(dirname(file), 'index.ts'));
		const moduleSymbol = entry && checker.getSymbolAtLocation(entry);
		if (!moduleSymbol) throw new Error(`${file}: no index.ts entry beside it`);
		return new Map(checker.getExportsOfModule(moduleSymbol).map((symbol) => [symbol.name, symbol]));
	};

	return partFiles(source, dirname(index)).map(({ name, file }) => {
		const component = readFileSync(file, 'utf8');
		const { propsName, defaults } = propsDeclaration(component, file);
		const types = exportedTypes(file);
		const propsSymbol = types.get(propsName);
		if (!propsSymbol) throw new Error(`${file}: ${propsName} is not exported beside it`);
		const stateSymbol = types.get(propsName.replace(/Props$/, 'State'));
		const header = headerComment(component);
		const files = new Set([file]);
		const table = (symbol: ts.Symbol, propDefaults: Defaults) =>
			members(checker, symbol, propDefaults, publicTypes, files);
		return {
			name,
			element: header.match(/Renders an? `(<[a-z0-9-]+>)`/)?.[1],
			description: header,
			// A plain `children` snippet is implied. One with arguments or a doc comment is listed.
			props: table(propsSymbol, defaults).filter(
				(prop) => prop.name !== 'children' || prop.description || prop.type !== 'Snippet'
			),
			state: stateSymbol ? table(stateSymbol, new Map()) : [],
			files: [...files]
		};
	});
}

let cached: { key: string; program: ts.Program } | undefined;

/** One program over every library entry. It is rebuilt when a `.ts` file in the library changes. */
function createProgram(lib: string): ts.Program {
	const files = typeScriptFiles(lib);
	const key = files.map((file) => `${file}:${statSync(file).mtimeMs}`).join('\n');
	if (cached?.key === key) return cached.program;
	const entries = readdirSync(lib)
		.map((folder) => join(lib, folder, 'index.ts'))
		.filter((file) => files.includes(file));
	const program = ts.createProgram(entries, {
		target: ts.ScriptTarget.ESNext,
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		strict: true,
		skipLibCheck: true,
		noEmit: true,
		types: []
	});
	cached = { key, program };
	return program;
}

function typeScriptFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return typeScriptFiles(path);
		return entry.name.endsWith('.ts') && !/\.(spec|test)\.ts$/.test(entry.name) ? [path] : [];
	});
}

/**
 * The parts an entry exports. A namespace object such as `export const Collapsible = { Root, ... }`
 * wins over named exports, so `Checkbox.Root` is listed once even when `CheckboxRoot` is also exported.
 */
function partFiles(source: ts.SourceFile, dir: string): Array<{ name: string; file: string }> {
	const imports = new Map<string, string>();
	const namespaces: Array<{ name: string; file: string }> = [];
	const named: Array<{ name: string; file: string }> = [];
	const svelteFile = (specifier: string) =>
		specifier.endsWith('.svelte') ? resolve(dir, specifier) : undefined;

	for (const statement of source.statements) {
		if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
			const file = svelteFile(statement.moduleSpecifier.text);
			const local = statement.importClause?.name?.text;
			if (file && local) imports.set(local, file);
		} else if (
			ts.isExportDeclaration(statement) &&
			statement.exportClause &&
			ts.isNamedExports(statement.exportClause)
		) {
			const from =
				statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
					? svelteFile(statement.moduleSpecifier.text)
					: undefined;
			for (const element of statement.exportClause.elements) {
				const local = (element.propertyName ?? element.name).text;
				const file = from && local === 'default' ? from : imports.get(local);
				if (file) named.push({ name: element.name.text, file });
			}
		} else if (
			ts.isVariableStatement(statement) &&
			statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
		) {
			for (const declaration of statement.declarationList.declarations) {
				if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
				let parts = declaration.initializer;
				// `Object.assign(FormRoot, { Error })` is the `Form` part plus `Form.Error`.
				if (
					ts.isCallExpression(parts) &&
					parts.expression.getText(source) === 'Object.assign' &&
					parts.arguments.length === 2 &&
					ts.isIdentifier(parts.arguments[0])
				) {
					const file = imports.get(parts.arguments[0].text);
					if (file) namespaces.push({ name: declaration.name.text, file });
					parts = parts.arguments[1];
				}
				if (!ts.isObjectLiteralExpression(parts)) continue;
				for (const property of parts.properties) {
					const key =
						property.name && ts.isIdentifier(property.name) ? property.name.text : undefined;
					const value = ts.isShorthandPropertyAssignment(property)
						? property.name.text
						: ts.isPropertyAssignment(property) && ts.isIdentifier(property.initializer)
							? property.initializer.text
							: undefined;
					const file = value && imports.get(value);
					if (key && file) namespaces.push({ name: `${declaration.name.text}.${key}`, file });
				}
			}
		}
	}
	return namespaces.length ? namespaces : named;
}

/** Props and state members declared in the library. Inherited HTML attributes are left out. */
function members(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
	defaults: Defaults,
	publicTypes: Set<string>,
	files: Set<string>
): ApiProp[] {
	const type = checker.getDeclaredTypeOfSymbol(
		symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
	);
	return checker
		.getPropertiesOfType(type)
		.filter((property) =>
			property.declarations?.some(
				(declaration) => !declaration.getSourceFile().fileName.includes('/node_modules/')
			)
		)
		.map((property): ApiProp => {
			const declaration = property.declarations![0];
			files.add(declaration.getSourceFile().fileName);
			const typeNode =
				ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration)
					? declaration.type
					: undefined;
			// The type as written, with private aliases expanded. An indexed access is resolved.
			const typeText =
				(typeNode && readableType(checker, typeNode, publicTypes)) ??
				checker
					.typeToString(
						checker.getTypeOfSymbol(property),
						undefined,
						ts.TypeFormatFlags.NoTruncation
					)
					.replace(/ \| undefined$/, '');
			const docs = ts.displayPartsToString(property.getDocumentationComment(checker));
			const tagDefault = property.getJsDocTags(checker).find((tag) => tag.name === 'default');
			const inlineDefault = docs.match(/@default\s+(\S+)/)?.[1];
			const code = defaults.get(property.name);
			return {
				name: property.name,
				type: typeText
					.replace(/\s+/g, ' ')
					.replace(/([<[(]) /g, '$1')
					.replace(/,? ([>\])])/g, '$1')
					.replace(/^\| /, ''),
				default:
					(tagDefault?.text ? ts.displayPartsToString(tagDefault.text) : inlineDefault) ??
					code?.value,
				description: docs
					.replace(/\s*@default\s+\S+\s*/, ' ')
					.replace(/\s+/g, ' ')
					.trim(),
				bindable: code?.bindable ?? false
			};
		})
		.filter((prop) => prop.description || !/^on[a-z]/.test(prop.name))
		.sort((a, b) => order(a) - order(b));
}

/** Upstream lists the main props first and `render` last. */
const order = (prop: ApiProp) =>
	prop.name === 'render' ? 2 : prop.name === 'class' || prop.name === 'style' ? 1 : 0;

type Defaults = Map<string, { value?: string; bindable: boolean }>;

/** Type names a consumer can import from `@sveltery/base`. */
function publicTypeNames(program: ts.Program, checker: ts.TypeChecker, lib: string): Set<string> {
	const names = new Set<string>();
	for (const folder of readdirSync(lib)) {
		const entry = program.getSourceFile(join(lib, folder, 'index.ts'));
		const moduleSymbol = entry && checker.getSymbolAtLocation(entry);
		if (moduleSymbol)
			for (const symbol of checker.getExportsOfModule(moduleSymbol)) names.add(symbol.name);
	}
	return names;
}

/**
 * The type as written, with each private alias such as `PartRender<HTMLDivElement, State>`
 * replaced by its definition, so the table names only types a consumer can look up.
 * Returns undefined for an indexed access such as `Params['side']`, which reads better resolved.
 */
function readableType(
	checker: ts.TypeChecker,
	node: ts.TypeNode,
	publicTypes: Set<string>,
	substitutions = new Map<string, string>()
): string | undefined {
	const edits: Array<{ start: number; end: number; text: string }> = [];
	let indexed = false;
	const visit = (child: ts.Node) => {
		if (ts.isIndexedAccessTypeNode(child)) {
			indexed = true;
			return;
		}
		if (ts.isTypeReferenceNode(child) && ts.isIdentifier(child.typeName)) {
			const name = child.typeName.text;
			const substitution = substitutions.get(name);
			if (substitution !== undefined) {
				edits.push({ start: child.getStart(), end: child.getEnd(), text: substitution });
				return;
			}
			let symbol = checker.getSymbolAtLocation(child.typeName);
			if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
			const declaration = symbol?.declarations?.[0];
			if (
				declaration &&
				ts.isTypeAliasDeclaration(declaration) &&
				!publicTypes.has(name) &&
				!declaration.getSourceFile().fileName.includes('/node_modules/')
			) {
				const args = (child.typeArguments ?? []).map((arg) =>
					readableType(checker, arg, publicTypes, substitutions)
				);
				if (args.some((arg) => arg === undefined)) {
					indexed = true;
					return;
				}
				const inner = new Map(
					(declaration.typeParameters ?? []).map((parameter, i) => [
						parameter.name.text,
						args[i] ?? parameter.default?.getText() ?? 'unknown'
					])
				);
				const text = readableType(checker, declaration.type, publicTypes, inner);
				if (text === undefined) {
					indexed = true;
					return;
				}
				edits.push({ start: child.getStart(), end: child.getEnd(), text });
				return;
			}
		}
		ts.forEachChild(child, visit);
	};
	visit(node);
	if (indexed) return undefined;
	let text = node.getText();
	const offset = node.getStart();
	for (const edit of edits.sort((x, y) => y.start - x.start)) {
		text = text.slice(0, edit.start - offset) + edit.text + text.slice(edit.end - offset);
	}
	return text;
}

/** The first comment of a component file, without its attribution lines. */
function headerComment(component: string): string {
	const comment = component.match(/^\s*<!--([\s\S]*?)-->/)?.[1] ?? '';
	return comment
		.split(/\bDerived from\b/)[0]
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * The props type named in the component's `$props()` annotation, and the default values and
 * `$bindable` markers from its destructuring.
 */
function propsDeclaration(
	component: string,
	file: string
): { propsName: string; defaults: Defaults } {
	const instance = parse(component, { modern: true }).instance;
	// Svelte's parser sets offsets on the script's Program node, which ESTree's type omits.
	const content = instance?.content as { start: number; end: number } | undefined;
	const script = content ? component.slice(content.start, content.end) : '';
	const source = ts.createSourceFile('component.ts', script, ts.ScriptTarget.ESNext, true);
	const defaults: Defaults = new Map();
	let propsName: string | undefined;
	const visit = (node: ts.Node) => {
		if (
			ts.isVariableDeclaration(node) &&
			node.initializer &&
			ts.isCallExpression(node.initializer) &&
			node.initializer.expression.getText() === '$props' &&
			ts.isObjectBindingPattern(node.name)
		) {
			if (node.type && ts.isTypeReferenceNode(node.type)) propsName = node.type.typeName.getText();
			for (const element of node.name.elements) {
				if (element.dotDotDotToken) continue;
				const name = (element.propertyName ?? element.name).getText();
				let initializer = element.initializer;
				let bindable = false;
				if (
					initializer &&
					ts.isCallExpression(initializer) &&
					initializer.expression.getText() === '$bindable'
				) {
					bindable = true;
					initializer = initializer.arguments[0];
				}
				const value = initializer?.getText();
				defaults.set(name, { value: value && isLiteral(value) ? value : undefined, bindable });
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(source);
	if (!propsName) throw new Error(`${file}: no typed $props() declaration`);
	return { propsName, defaults };
}

/** `= undefined` is not listed: the real default is applied later, where the table cannot see it. */
const isLiteral = (value: string) =>
	/^(true|false|null|-?\d[\d.]*|'[^']*'|"[^"]*"|\[\])$/.test(value);
