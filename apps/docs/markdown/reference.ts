import type { ApiConstant, ApiPart, ApiProp } from './api.ts';
import { highlightInline, toHast } from './code-inline.ts';
import type { HastNode } from './headings.ts';
import { highlightType } from './highlight.ts';
import { codeLanguage } from './markdown-code.ts';

/** One row of a reference table, with its type, default and description as HTML. */
export type ReferenceRow = {
	name: string;
	required: boolean;
	bindable: boolean;
	shortType: string;
	type: string;
	default?: string;
	description: string;
};

/** A data attribute or CSS variable, with its description as HTML. */
export type ReferenceConstant = { name: string; description: string };

/** An additional type as Base UI's `AdditionalTypes` shows it: a heading and its declaration. */
export type ReferenceType = { name: string; slug: string; code: string };

/** A part as its reference tables show it. */
export type ReferencePart = {
	name: string;
	description: string;
	props: ReferenceRow[];
	state: ReferenceRow[];
	dataAttributes: ReferenceConstant[];
	cssVariables: ReferenceConstant[];
	/** The text under the heading when the part takes no props. */
	empty?: string;
};

const escape = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CODE = /`([^`]+)`/g;

/** Inline markdown as HTML, with each code span written by `code`. */
function inline(value: string, code: (source: string) => string): string {
	const spans: string[] = [];
	const text = value.replace(
		CODE,
		(_span, source: string) => `\0${spans.push(code(source)) - 1}\0`
	);
	return escape(text)
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a class="Link" href="$2">$1</a>')
		.replace(/\0(\d+)\0/g, (_span, index: string) => spans[Number(index)]);
}

/**
 * Doc comments use paragraphs, `- ` lists, code spans and links, and nothing else. This keeps code
 * spans plain, for the release notes, which render on the client.
 */
export const inlineMarkdown = (value: string) =>
	inline(
		value,
		(source) =>
			`<code class="Code MdCode${/^<\/?[a-z][a-z0-9-]*\s*\/?>$/.test(source) ? ' MdTag' : ''}" data-inline>${escape(source)}</code>`
	);

/** `codeInline`'s spans as HTML. They hold only text, wrapper classes and colors. */
function toHtml(node: HastNode): string {
	if (node.type === 'text') return node.value!;
	const { className, style } = node.properties ?? {};
	const attributes =
		(className ? ` class="${(className as string[]).join(' ')}"` : '') +
		(style ? ` style="${style}"` : '');
	return `<span${attributes}>${node.children!.map(toHtml).join('')}</span>`;
}

/** A code span as `codeInline` highlights one in page prose. */
async function highlightedCode(source: string): Promise<string> {
	const { code, language } = codeLanguage(source);
	const tokens = await highlightInline(code, language);
	const open = `<code class="Code MdCode language-${language}"`;
	return tokens
		? `${open} data-inline>${toHast(tokens, escape).map(toHtml).join('')}</code>`
		: `${open}>${escape(code)}</code>`;
}

/** Inline markdown with its code spans highlighted, as page prose is. */
export async function highlightedMarkdown(value: string): Promise<string> {
	const spans = await Promise.all(
		[...value.matchAll(CODE)].map(([, source]) => highlightedCode(source))
	);
	return inline(value, () => spans.shift()!);
}

/** A description with its links reduced to their text, for meta tags and the search index. */
export const plainText = (value: string) => value.replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1');

async function block(paragraph: string): Promise<string> {
	const lines = paragraph.split('\n');
	const text = lines.filter((line) => !line.startsWith('- ')).join(' ');
	const items = await Promise.all(
		lines
			.filter((line) => line.startsWith('- '))
			.map(
				async (line) => `<li class="MdListItem">${await highlightedMarkdown(line.slice(2))}</li>`
			)
	);
	return (
		(text ? `<p class="MdP">${await highlightedMarkdown(text)}</p>` : '') +
		(items.length ? `<ul class="MdUl">${items.join('')}</ul>` : '')
	);
}

const paragraphs = async (value: string) =>
	(await Promise.all(value.split('\n\n').filter(Boolean).map(block))).join('');

/** Splits a type at its top-level `|`. */
function unionMembers(type: string): string[] {
	const members: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < type.length; i++) {
		const char = type[i];
		if ('([{<'.includes(char)) depth++;
		else if (')]}'.includes(char) || (char === '>' && type[i - 1] !== '=')) depth--;
		else if (char === '|' && depth === 0) {
			members.push(type.slice(start, i).trim());
			start = i + 1;
		}
	}
	members.push(type.slice(start).trim());
	return members.filter(Boolean);
}

/** `((state) => string)` is `(state) => string`. */
function unwrap(member: string): string {
	while (member.startsWith('(') && member.endsWith(')')) {
		let depth = 0;
		let closesAtEnd = true;
		for (let i = 0; i < member.length - 1; i++) {
			if (member[i] === '(') depth++;
			else if (member[i] === ')' && --depth === 0) closesAtEnd = false;
		}
		if (!closesAtEnd) break;
		member = member.slice(1, -1).trim();
	}
	return member;
}

const isFunction = (member: string) => /^(<[^>]*>\s*)?\(.*\)\s*=>/.test(unwrap(member));

/** Base UI's table shows each function type in a union as `function`, and the full type when opened. */
export function shortType(type: string): string {
	const members = unionMembers(type).map((member) => (isFunction(member) ? 'function' : member));
	return [...new Set(members)].join(' | ');
}

async function row(prop: ApiProp): Promise<ReferenceRow> {
	return {
		name: prop.name,
		required: prop.required,
		bindable: prop.bindable,
		shortType: await highlightType(shortType(prop.type)),
		type: await highlightType(prop.type),
		default:
			prop.default === undefined ? undefined : await highlightType(prop.default, { value: true }),
		description: await paragraphs(prop.description)
	};
}

const constant = async ({ name, description }: ApiConstant): Promise<ReferenceConstant> => ({
	name,
	description: await highlightedMarkdown(description)
});

export async function referencePart(part: ApiPart): Promise<ReferencePart> {
	return {
		name: part.name,
		description: await paragraphs(part.description),
		props: await Promise.all(part.props.map(row)),
		state: await Promise.all(part.state.map(row)),
		dataAttributes: await Promise.all(part.dataAttributes.map(constant)),
		cssVariables: await Promise.all(part.cssVariables.map(constant)),
		empty: part.props.length
			? undefined
			: part.element
				? "This part takes no props beyond its element's HTML attributes."
				: 'This part takes no props.'
	};
}
