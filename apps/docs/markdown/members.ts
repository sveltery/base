import { highlightType } from './highlight.ts';
import { shortType } from './reference.ts';

export type MemberParam = { name: string; optional: boolean; type: string };

/** One row of a members table. Types and defaults are Shiki HTML, descriptions mdsvex HTML. */
export type MemberRow = {
	name: string;
	shortType: string;
	type: string;
	extra: string;
	description: string;
	params: MemberParam[];
};

/** A handle's properties or methods, or a function's parameters or return value properties. */
export type MemberTable = {
	label: 'Property' | 'Parameter' | 'Prop' | 'Method';
	/** The third column: a property's modifiers or a parameter's default. */
	extra?: 'Modifiers' | 'Default';
	rows: MemberRow[];
};

export const MEMBER_LABELS = ['Property', 'Parameter', 'Prop', 'Method'] as const;

/** Splits `a: string, b?: (x: number) => void` at its top-level commas. */
function splitTopLevel(value: string, separator: string): string[] {
	const parts: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < value.length; i++) {
		const char = value[i];
		if ('([{<'.includes(char)) depth++;
		else if (')]}'.includes(char) || (char === '>' && value[i - 1] !== '=')) depth--;
		else if (char === separator && depth === 0) {
			parts.push(value.slice(start, i).trim());
			start = i + 1;
		}
	}
	parts.push(value.slice(start).trim());
	return parts.filter(Boolean);
}

async function params(signature: string): Promise<MemberParam[]> {
	return Promise.all(
		splitTopLevel(signature, ',').map(async (param) => {
			const [, name, optional, type] = param.match(/^(\w+)(\?)?\s*:\s*([\s\S]+)$/) ?? [];
			if (!name) throw new Error(`Cannot read the parameter "${param}"`);
			return { name, optional: Boolean(optional), type: await highlightType(type) };
		})
	);
}

const escape = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Builds a members table from a markdown table's header and cells. `html` strips a cell's tags.
 * The first column names the member; `Description` goes into the opened row. A
 * table without a `Type` (or, for methods, `Returns`) column stays a plain table.
 */
export async function memberTable(
	head: string[],
	rows: string[][],
	html: (cell: string) => string
): Promise<MemberTable | undefined> {
	const text = (cell: string) =>
		html(cell)
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&amp;/g, '&');
	const columns = head.map(text);
	const label = columns[0] as MemberTable['label'];
	const column = (name: string) => columns.indexOf(name);
	const typeColumn = column(label === 'Method' ? 'Returns' : 'Type');
	const extra = (['Modifiers', 'Default'] as const).find((name) => column(name) !== -1);
	const paramsColumn = column('Parameters');
	const descriptionColumn = column('Description');
	if (typeColumn === -1) return undefined;

	return {
		label,
		extra,
		rows: await Promise.all(
			rows.map(async (cells) => {
				const extraText = extra ? text(cells[column(extra)]) : '';
				const type = text(cells[typeColumn]);
				return {
					name: text(cells[0]),
					shortType: await highlightType(shortType(type)),
					type: await highlightType(type),
					extra:
						!extraText || extraText === '-' || extraText === '—'
							? ''
							: extra === 'Default'
								? await highlightType(extraText, { value: true })
								: `<span style="color:var(--color-docs-infra-syntax-nullish)">${escape(extraText)}</span>`,
					description: descriptionColumn === -1 ? '' : cells[descriptionColumn],
					params: paramsColumn === -1 ? [] : await params(text(cells[paramsColumn]))
				};
			})
		)
	};
}
