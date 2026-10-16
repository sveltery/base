import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { ordering, sortByOrder } from './type-order.ts';

/** One row of a props or state table. */
export type ApiProp = {
	name: string;
	type: string;
	default?: string;
	description: string;
	bindable: boolean;
	required: boolean;
};

/** One data attribute or CSS variable, such as `data-open`. */
export type ApiConstant = {
	name: string;
	/** The value's type from a `@type` tag, such as `number` for `data-index`. */
	type?: string;
	description: string;
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
	dataAttributes: ApiConstant[];
	cssVariables: ApiConstant[];
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

	const parts = partFiles(source, dirname(index));
	const groups = constantGroups(checker, exportedTypes(index), parts);
	return parts.map(({ name, file, doc, propsType }) => {
		const component = readFileSync(file, 'utf8');
		const declaration = propsDeclaration(component, file);
		const { defaults } = declaration;
		const propsName = propsType ?? declaration.propsName;
		// A cast's props type is exported beside the namespace, not beside the shared file.
		const types = exportedTypes(propsType ? index : file);
		const propsSymbol = types.get(propsName);
		if (!propsSymbol) throw new Error(`${file}: ${propsName} is not exported beside it`);
		const stateSymbol = types.get(propsName.replace(/Props$/, 'State'));
		const header = doc ?? headerComment(component);
		const files = new Set([file]);
		const table = (symbol: ts.Symbol, propDefaults: Defaults) =>
			members(checker, symbol, propDefaults, publicTypes, files);
		return {
			name,
			element: header.match(/Renders an? `(<[a-z0-9-]+>)`/)?.[1],
			description: header,
			// A plain `children` snippet is implied. One with arguments or a doc comment is listed.
			props: sortByOrder(
				table(propsSymbol, defaults).filter(
					(prop) => prop.name !== 'children' || prop.description || prop.type !== 'Snippet'
				),
				ordering.props,
				(prop) => prop.name
			),
			state: stateSymbol ? table(stateSymbol, new Map()) : [],
			dataAttributes: groups.get(`${flat(name)}DataAttributes`) ?? [],
			cssVariables: groups.get(`${flat(name)}CssVariables`) ?? [],
			files: [...files, ...groups.files]
		};
	});
}

let parsed: { key: string; host: ts.CompilerHost; entries: string[] } | undefined;

const OPTIONS: ts.CompilerOptions = {
	target: ts.ScriptTarget.ESNext,
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.Bundler,
	strict: true,
	skipLibCheck: true,
	noEmit: true,
	types: []
};

/**
 * A program over every library entry, with a checker of its own. TypeScript orders union members
 * and mapped keys by when the checker first created each type, so a shared checker would let the
 * pages read before this one change its tables. Parsed files are shared, and reparsed when a `.ts`
 * file in the library changes.
 */
function createProgram(lib: string): ts.Program {
	const files = typeScriptFiles(lib);
	const key = files.map((file) => `${file}:${statSync(file).mtimeMs}`).join('\n');
	if (parsed?.key !== key) {
		const host = ts.createCompilerHost(OPTIONS);
		const sources = new Map<string, ts.SourceFile | undefined>();
		const getSourceFile = host.getSourceFile;
		host.getSourceFile = (fileName, ...rest) => {
			if (!sources.has(fileName)) sources.set(fileName, getSourceFile(fileName, ...rest));
			return sources.get(fileName);
		};
		const entries = readdirSync(lib)
			.map((folder) => join(lib, folder, 'index.ts'))
			.filter((file) => files.includes(file));
		parsed = { key, host, entries };
	}
	return ts.createProgram(parsed.entries, OPTIONS, parsed.host);
}

function typeScriptFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return typeScriptFiles(path);
		return entry.name.endsWith('.ts') && !/\.(spec|test)\.ts$/.test(entry.name) ? [path] : [];
	});
}

type PartFile = {
	name: string;
	file: string;
	/** The member's doc comment, for a part that shares its file with another component's part. */
	doc?: string;
	/** The props type in a member's `as Component<Props>` cast. */
	propsType?: string;
};

/**
 * The parts an entry exports. A namespace object such as `export const Collapsible = { Root, ... }`
 * wins over named exports, so `Checkbox.Root` is listed once even when `CheckboxRoot` is also exported.
 */
function partFiles(source: ts.SourceFile, dir: string): PartFile[] {
	const imports = new Map<string, string>();
	const namespaces: PartFile[] = [];
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
					// A generic part is written `Root: DialogRoot as typeof DialogRoot`.
					const cast =
						ts.isPropertyAssignment(property) && ts.isAsExpression(property.initializer)
							? property.initializer.type
							: undefined;
					const propsType =
						cast &&
						ts.isTypeReferenceNode(cast) &&
						cast.typeName.getText(source) === 'Component' &&
						cast.typeArguments?.[0]
							? cast.typeArguments[0].getText(source)
							: undefined;
					const comment = ts
						.getJSDocCommentsAndTags(property)
						.filter(ts.isJSDoc)
						.map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? '')
						.join('\n\n');
					const initializer = ts.isPropertyAssignment(property)
						? ts.isAsExpression(property.initializer)
							? property.initializer.expression
							: property.initializer
						: undefined;
					const value = ts.isShorthandPropertyAssignment(property)
						? property.name.text
						: initializer && ts.isIdentifier(initializer)
							? initializer.text
							: undefined;
					const file = value && imports.get(value);
					if (key && file) {
						namespaces.push({
							name: `${declaration.name.text}.${key}`,
							file,
							doc: comment ? paragraphs(comment) : undefined,
							propsType
						});
					}
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
				description: paragraphs(docs.replace(/\s*@default\s+\S+\s*/, ' ')),
				bindable: code?.bindable ?? false,
				required: !(property.flags & ts.SymbolFlags.Optional)
			};
		})
		.filter((prop) => prop.description || !/^on[a-z]/.test(prop.name));
}

/** `Accordion.Root` is `AccordionRoot`, the prefix of its `AccordionRootDataAttributes`. */
const flat = (name: string) => name.replaceAll('.', '');

const GROUP_KINDS = {
	DataAttributes: ordering.dataAttributes,
	CssVariables: ordering.cssVariables
};

/** The members of `const Name = { open: 'data-open' } as const`, in declaration order. */
function objectConstants(checker: ts.TypeChecker, symbol: ts.Symbol, name: string): ApiConstant[] {
	const declaration = symbol.valueDeclaration;
	let object =
		declaration && ts.isVariableDeclaration(declaration) ? declaration.initializer : undefined;
	while (object && ts.isAsExpression(object)) object = object.expression;
	if (!object || !ts.isObjectLiteralExpression(object)) {
		throw new Error(`${name} is not an object of constants`);
	}
	return object.properties.map((property) =>
		constant(checker, checker.getSymbolAtLocation(property.name!)!, name)
	);
}

/** One constant: its string value, its doc comment, and the type its `@type` tag names. */
function constant(checker: ts.TypeChecker, member: ts.Symbol, group: string): ApiConstant {
	const value = checker.getTypeOfSymbol(member);
	if (!value.isStringLiteral()) throw new Error(`${group}.${member.name} is not a string`);
	const typeTag = member.getJsDocTags(checker).find((tag) => tag.name === 'type');
	return {
		name: value.value,
		type: typeTag?.text ? ts.displayPartsToString(typeTag.text) : undefined,
		description: paragraphs(ts.displayPartsToString(member.getDocumentationComment(checker)))
	};
}

/**
 * The entry's data-attribute and CSS-variable objects, keyed by export name. Base UI matches each
 * to a part by name: `AccordionPanelCssVariables` holds the variables of `Accordion.Panel`.
 */
function constantGroups(
	checker: ts.TypeChecker,
	exports: Map<string, ts.Symbol>,
	parts: PartFile[]
): Map<string, ApiConstant[]> & { files: string[] } {
	const partNames = new Set(parts.map((part) => flat(part.name)));
	const groups = Object.assign(new Map<string, ApiConstant[]>(), { files: [] as string[] });
	for (const [name, exported] of exports) {
		const kind = (Object.keys(GROUP_KINDS) as Array<keyof typeof GROUP_KINDS>).find(
			(suffix) => name.endsWith(suffix) && name.length > suffix.length
		);
		if (!kind) continue;
		if (!partNames.has(name.slice(0, -kind.length))) {
			throw new Error(`${name} names no part. Parts: ${[...partNames].join(', ')}`);
		}
		const symbol =
			exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
		const constants =
			symbol.flags & ts.SymbolFlags.ValueModule
				? checker.getExportsOfModule(symbol).map((member) => constant(checker, member, name))
				: objectConstants(checker, symbol, name);
		groups.files.push(symbol.declarations![0].getSourceFile().fileName);
		// Base UI sorts a group by value, then applies its order.
		const byValue = constants.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
		groups.set(
			name,
			sortByOrder(byValue, GROUP_KINDS[kind], (constant) => constant.name)
		);
	}
	return groups;
}

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

/** Lines joined into paragraphs, which are separated by a blank line. A `- ` list item keeps its own line. */
const paragraphs = (text: string) =>
	text
		.split(/\n\s*\n/)
		.map((paragraph) =>
			paragraph
				.split(/\n(?=\s*- )/)
				.map((line) => line.replace(/\s+/g, ' ').trim())
				.join('\n')
		)
		.filter(Boolean)
		.join('\n\n');

/** The first comment of a component file, without its attribution lines. */
function headerComment(component: string): string {
	const comment = component.match(/^\s*<!--([\s\S]*?)-->/)?.[1] ?? '';
	return paragraphs(comment.split(/\bDerived from\b/)[0]);
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
