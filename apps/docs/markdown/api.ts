import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { compare, EVERYTHING_ELSE, ordering, sortByOrder } from './type-order.ts';

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
	/** The member that holds it, such as `open`. */
	key: string;
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

/** An exported type no part documents, such as `ImageLoadingStatus` or a data-attribute group. */
export type ApiType = {
	name: string;
	description: string;
	/** Its declaration, such as `type ImageLoadingStatus = 'idle' | 'loading'`, unformatted. */
	code: string;
	/** The part whose data attributes or CSS variables a constant group holds. */
	of?: { part: string; kind: ConstantKind };
};

/**
 * A type the reference names but a consumer cannot import, such as a private union of strings.
 * Base UI defines these under External Types rather than spelling them out at each use.
 */
export type ApiExternal = { name: string; code: string };

/** What one library folder documents. */
export type ApiFolder = { parts: ApiPart[]; types: ApiType[]; externals: ApiExternal[] };

/**
 * Reads the public parts of one library folder, such as `collapsible`, and their props and
 * state from the TypeScript types the components declare.
 */
export const apiReference = (lib: string, folder: string): ApiPart[] =>
	apiFolder(lib, folder).parts;

export function apiFolder(lib: string, folder: string): ApiFolder {
	const current = library(lib);
	let read = current.folders.get(folder);
	if (!read) {
		read = readFolder(lib, folder, ts.createProgram(current.entries, OPTIONS, current.host));
		current.folders.set(folder, read);
	}
	return read;
}

function readFolder(lib: string, folder: string, program: ts.Program): ApiFolder {
	const index = join(lib, folder, 'index.ts');
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

	const partList = partFiles(source, dirname(index));
	const entryExports = exportedTypes(index);
	const { groups, files: groupFiles } = constantGroups(checker, entryExports, partList);
	const externals = new Map<string, string>();
	const documented = new Set<string>();
	const parts = partList.map(({ name, file, doc, propsType }): ApiPart => {
		const component = readFileSync(file, 'utf8');
		const declaration = propsDeclaration(component, file);
		const { defaults } = declaration;
		const propsName = propsType ?? declaration.propsName;
		// A cast's props type is exported beside the namespace, not beside the shared file.
		const types = exportedTypes(propsType ? index : file);
		const propsSymbol = types.get(propsName);
		if (!propsSymbol) throw new Error(`${file}: ${propsName} is not exported beside it`);
		const stateSymbol = types.get(propsName.replace(/Props$/, 'State'));
		for (const documentedName of [propsName, `${flat(name)}Props`]) {
			documented.add(documentedName).add(documentedName.replace(/Props$/, 'State'));
		}
		const header = doc ?? headerComment(component);
		const files = new Set([file]);
		const table = (symbol: ts.Symbol, propDefaults: Defaults) =>
			members(checker, symbol, propDefaults, publicTypes, files, externals);
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
			dataAttributes: tableOrder(groups.get(`${flat(name)}DataAttributes`)),
			cssVariables: tableOrder(groups.get(`${flat(name)}CssVariables`)),
			files: [...files, ...groupFiles]
		};
	});
	const types = [...entryExports].flatMap(([name, exported]): ApiType[] => {
		const group = groups.get(name);
		if (group) {
			const part = partList.find((candidate) => name === flat(candidate.name) + group.kind)!;
			return [
				{
					name,
					description: '',
					code: constantNamespace(name, group.constants),
					of: { part: part.name, kind: group.kind }
				}
			];
		}
		const symbol =
			exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
		if (
			documented.has(name) ||
			symbol.flags & ts.SymbolFlags.Value ||
			!(symbol.flags & (ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Interface))
		) {
			return [];
		}
		return [
			{
				name,
				description: paragraphs(ts.displayPartsToString(symbol.getDocumentationComment(checker))),
				code: typeDeclaration(checker, symbol, name, publicTypes, externals)
			}
		];
	});
	return {
		parts,
		types,
		externals: [...externals].map(([name, code]) => ({ name, code }))
	};
}

/** Where Base UI's `typeSuffixes` puts a type, as its `sortAdditionalTypes` ranks a flat name. */
const suffixRank = (name: string) => {
	const rank = ordering.typeSuffixes.indexOf(name);
	return rank === -1 ? ordering.typeSuffixes.indexOf(EVERYTHING_ELSE) : rank;
};

/** Additional types in Base UI's order: by `typeSuffixes`, then by name. */
export const sortTypes = (types: ApiType[]) =>
	types.sort(
		(a, b) => suffixRank(a.name) - suffixRank(b.name) || a.name.localeCompare(b.name, 'en')
	);

/** `type Name<T> = ...` as written, or an interface as an object type with its members' docs. */
function typeDeclaration(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
	name: string,
	publicTypes: Set<string>,
	externals: Map<string, string>
): string {
	const declaration = symbol.declarations![0];
	const parameters =
		ts.isTypeAliasDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)
			? declaration.typeParameters
			: undefined;
	const head = `${name}${parameters ? `<${parameters.map((p) => p.getText()).join(', ')}>` : ''}`;
	const resolved = checker.getDeclaredTypeOfSymbol(symbol);
	// An object built from other types, such as `Partial<Omit<ToastObject, 'id'>>`, reads better
	// as its members, as Base UI expands it.
	const object =
		!(resolved.flags & ts.TypeFlags.Union) &&
		resolved.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection) &&
		!resolved.getCallSignatures().length &&
		checker.getPropertiesOfType(resolved).length > 0;
	if (ts.isTypeAliasDeclaration(declaration) && !object) {
		const text =
			readableType(checker, declaration.type, publicTypes, new Map(), externals) ??
			checker.typeToString(
				resolved,
				undefined,
				ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias
			);
		return `type ${head} = ${text};`;
	}
	return objectType(head, members(checker, symbol, new Map(), publicTypes, new Set(), externals));
}

const jsDoc = (lines: string[]) =>
	lines.length === 0
		? []
		: lines.length === 1
			? [`/** ${lines[0]} */`]
			: ['/**', ...lines.map((line) => (line ? ` * ${line}` : ' *')), ' */'];

/** `type AccordionRootState = { ... }`, each member under its doc comment. */
export const objectType = (head: string, props: ApiProp[]) =>
	[
		`type ${head} = {`,
		...props.flatMap((prop) => [
			...jsDoc(prop.description ? prop.description.split('\n') : []),
			// `?` already says a member can be undefined, as Base UI's `stripTrailingUndefined` assumes.
			`${prop.name}${prop.required ? '' : '?'}: ${prop.required ? prop.type : prop.type.replace(/ \| undefined$/, '')};`
		]),
		'};'
	].join('\n');

/** A constant group as Base UI declares it: `declare namespace Name { const open: 'data-open'; }`. */
const constantNamespace = (name: string, constants: ApiConstant[]) =>
	[
		`declare namespace ${name} {`,
		...constants.flatMap((constant) => [
			...jsDoc([
				...(constant.description ? constant.description.split('\n') : []),
				...(constant.type ? [`@type ${constant.type}`] : [])
			]),
			`const ${constant.key}: '${constant.name}';`
		]),
		'}'
	].join('\n');

const OPTIONS: ts.CompilerOptions = {
	target: ts.ScriptTarget.ESNext,
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.Bundler,
	strict: true,
	skipLibCheck: true,
	noEmit: true,
	types: []
};

type Library = {
	key: string;
	host: ts.CompilerHost;
	entries: string[];
	folders: Map<string, ApiFolder>;
};
let cached: Library | undefined;

/**
 * The library's parsed files and each folder's parts, kept until a `.ts` or `.svelte` file in it
 * changes. Each folder is read with a checker of its own: TypeScript orders union members and
 * mapped keys by when the checker first created each type, so a shared checker would let the
 * folders read before this one change its tables.
 */
function library(lib: string): Library {
	const files = libraryFiles(lib);
	const key = files.map((file) => `${file}:${statSync(file).mtimeMs}`).join('\n');
	if (cached?.key === key) return cached;
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
	cached = { key, host, entries, folders: new Map() };
	return cached;
}

function libraryFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return libraryFiles(path);
		return /\.(ts|svelte)$/.test(entry.name) && !/\.(spec|test)\.ts$/.test(entry.name)
			? [path]
			: [];
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

/** Whether a declaration is a `never` member that keeps a prop out of one branch of a union. */
const excludes = (declaration: ts.Declaration) =>
	ts.isPropertySignature(declaration) && declaration.type?.kind === ts.SyntaxKind.NeverKeyword;

/** Props and state members declared in the library. Inherited HTML attributes are left out. */
function members(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
	defaults: Defaults,
	publicTypes: Set<string>,
	files: Set<string>,
	externals: Map<string, string>
): ApiProp[] {
	const type = checker.getDeclaredTypeOfSymbol(
		symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
	);
	return (
		checker
			.getPropertiesOfType(type)
			// A symbol-keyed member such as `[subscribe]` has no name a consumer can write.
			.filter((property) => !property.name.startsWith('__@'))
			.filter((property) =>
				property.declarations?.some(
					(declaration) =>
						!declaration.getSourceFile().fileName.includes('/node_modules/') &&
						!excludes(declaration)
				)
			)
			.map((property): ApiProp => {
				// In a union of props, such as Form's remote and plain props, a member typed `never`
				// only excludes the prop from that branch. Document the branch that accepts it.
				const declaration =
					property.declarations!.find(
						(candidate) =>
							!excludes(candidate) && !candidate.getSourceFile().fileName.includes('/node_modules/')
					) ?? property.declarations![0];
				const declared =
					ts.isPropertySignature(declaration) && checker.getSymbolAtLocation(declaration.name);
				const documented = declared || property;
				files.add(declaration.getSourceFile().fileName);
				const typeNode =
					ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration)
						? declaration.type
						: undefined;
				// The type as written, with private aliases expanded. An indexed access is resolved.
				const typeText =
					(typeNode && readableType(checker, typeNode, publicTypes, new Map(), externals)) ??
					checker
						.typeToString(
							checker.getTypeOfSymbol(property),
							undefined,
							ts.TypeFormatFlags.NoTruncation
						)
						.replace(/ \| undefined$/, '');
				const docs = ts.displayPartsToString(documented.getDocumentationComment(checker));
				const tagDefault = documented.getJsDocTags(checker).find((tag) => tag.name === 'default');
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
			.filter((prop) => prop.description || !/^on[a-z]/.test(prop.name))
	);
}

/** `Accordion.Root` is `AccordionRoot`, the prefix of its `AccordionRootDataAttributes`. */
const flat = (name: string) => name.replaceAll('.', '');

const GROUP_KINDS = {
	DataAttributes: ordering.dataAttributes,
	CssVariables: ordering.cssVariables
};
type ConstantKind = keyof typeof GROUP_KINDS;
type ConstantGroup = { kind: ConstantKind; constants: ApiConstant[] };

/** A group's table rows: Base UI sorts them by value, then applies its order. */
function tableOrder(group: ConstantGroup | undefined): ApiConstant[] {
	if (!group) return [];
	const byValue = [...group.constants].sort((a, b) => compare(a.name, b.name));
	return sortByOrder(byValue, GROUP_KINDS[group.kind], (constant) => constant.name);
}

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
		key: member.name,
		name: value.value,
		// `@type {number}` names `number`, as Base UI's table shows it.
		type: typeTag?.text
			? ts.displayPartsToString(typeTag.text).replace(/^\{([\s\S]*)\}$/, '$1')
			: undefined,
		description: paragraphs(ts.displayPartsToString(member.getDocumentationComment(checker)))
	};
}

/**
 * The entry's data-attribute and CSS-variable objects, keyed by export name, in declaration order.
 * Base UI matches each to a part by name: `AccordionPanelCssVariables` holds the variables of
 * `Accordion.Panel`.
 */
function constantGroups(
	checker: ts.TypeChecker,
	exports: Map<string, ts.Symbol>,
	parts: PartFile[]
): { groups: Map<string, ConstantGroup>; files: string[] } {
	const partNames = new Set(parts.map((part) => flat(part.name)));
	const groups = new Map<string, ConstantGroup>();
	const files: string[] = [];
	for (const [name, exported] of exports) {
		const kind = (Object.keys(GROUP_KINDS) as ConstantKind[]).find(
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
		files.push(symbol.declarations![0].getSourceFile().fileName);
		groups.set(name, { kind, constants });
	}
	return { groups, files };
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
 * A private union of literals or function type keeps its name, as Base UI keeps it, and its
 * definition goes to `externals`.
 * Returns undefined for an indexed access such as `Params['side']`, which reads better resolved.
 */
function readableType(
	checker: ts.TypeChecker,
	node: ts.TypeNode,
	publicTypes: Set<string>,
	substitutions: Map<string, string>,
	externals: Map<string, string>
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
				if (!declaration.typeParameters && isExternal(checker, declaration)) {
					if (!externals.has(name)) {
						externals.set(name, '');
						externals.set(
							name,
							`type ${name} = ${externalDefinition(checker, declaration, publicTypes, externals)};`
						);
					}
					return;
				}
				const args = (child.typeArguments ?? []).map((arg) =>
					readableType(checker, arg, publicTypes, substitutions, externals)
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
				const text = readableType(checker, declaration.type, publicTypes, inner, externals);
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

/** A union's members as values, such as `'up' | 'down'` for `typeof SWIPE.up | typeof SWIPE.down`. */
function externalDefinition(
	checker: ts.TypeChecker,
	declaration: ts.TypeAliasDeclaration,
	publicTypes: Set<string>,
	externals: Map<string, string>
): string {
	if (ts.isFunctionTypeNode(declaration.type)) {
		return (
			readableType(checker, declaration.type, publicTypes, new Map(), externals) ??
			declaration.type.getText()
		);
	}
	// Each member as written, in the order written, rather than in the checker's union order.
	const members = (node: ts.TypeNode): ts.Type[] => {
		if (ts.isUnionTypeNode(node)) return node.types.flatMap(members);
		const type = checker.getTypeFromTypeNode(node);
		return type.isUnion() ? type.types : [type];
	};
	return members(declaration.type)
		.map((member) => checker.typeToString(member).replace(/^"(.*)"$/, "'$1'"))
		.join(' | ');
}

/**
 * Base UI's external types: a union of string, number and boolean literals, or a function type.
 * Unions with `undefined`, such as a transition status, are spelled out where they are used.
 */
function isExternal(checker: ts.TypeChecker, declaration: ts.TypeAliasDeclaration): boolean {
	if (ts.isFunctionTypeNode(declaration.type)) return true;
	const type = checker.getTypeAtLocation(declaration.name);
	const literal = (member: ts.Type) =>
		member.isLiteral() ||
		!!(
			member.flags &
			(ts.TypeFlags.BooleanLike |
				ts.TypeFlags.String |
				ts.TypeFlags.Number |
				ts.TypeFlags.TemplateLiteral)
		);
	return type.isUnion() ? type.types.every(literal) : literal(type);
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
