import type { ApiPart, ApiProp } from './api.ts';
import { highlightType } from './highlight.ts';

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

/** A part as its reference tables show it. */
export type ReferencePart = {
	name: string;
	description: string;
	props: ReferenceRow[];
	state: ReferenceRow[];
	/** The text under the heading when the part takes no props. */
	empty?: string;
};

const escape = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Doc comments use paragraphs, `- ` lists, code spans and links, and nothing else. */
export function inlineMarkdown(value: string): string {
	return escape(value)
		.replace(
			/`([^`]+)`/g,
			(_code, value: string) =>
				`<code class="Code MdCode${/^&lt;\/?[a-z][a-z0-9-]*\s*\/?&gt;$/.test(value) ? ' MdTag' : ''}" data-inline>${value}</code>`
		)
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a class="Link" href="$2">$1</a>');
}

/** A description with its links reduced to their text, for meta tags and the search index. */
export const plainText = (value: string) => value.replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1');

function block(paragraph: string): string {
	const lines = paragraph.split('\n');
	const text = lines.filter((line) => !line.startsWith('- ')).join(' ');
	const items = lines
		.filter((line) => line.startsWith('- '))
		.map((line) => `<li class="MdListItem">${inlineMarkdown(line.slice(2))}</li>`);
	return (
		(text ? `<p class="MdP">${inlineMarkdown(text)}</p>` : '') +
		(items.length ? `<ul class="MdUl">${items.join('')}</ul>` : '')
	);
}

const paragraphs = (value: string) => value.split('\n\n').filter(Boolean).map(block).join('');

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
		description: paragraphs(prop.description)
	};
}

export async function referencePart(part: ApiPart): Promise<ReferencePart> {
	return {
		name: part.name,
		description: paragraphs(part.description),
		props: await Promise.all(part.props.map(row)),
		state: await Promise.all(part.state.map(row)),
		empty: part.props.length
			? undefined
			: part.element
				? "This part takes no props beyond its element's HTML attributes."
				: 'This part takes no props.'
	};
}
