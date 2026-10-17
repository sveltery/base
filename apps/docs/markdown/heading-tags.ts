import { text as textOf, type MdNode } from './headings.ts';

/** The one badge a heading can show. Anything else in brackets stays in the heading text. */
const HEADING_TAGS = new Set(['New', 'Preview']);

const TRAILING_TAG = new RegExp(`\\s+\\[(${[...HEADING_TAGS].join('|')})\\]\\s*$`);

/** A heading's text without its trailing tag, as the page shows it. */
export const stripHeadingTag = (title: string) => title.replace(TRAILING_TAG, '');

type Split = { children: MdNode[]; tag: string };

/**
 * mdsvex's remark parses `[Preview]` as a reference even when nothing defines it, and renders it
 * as the bracketed text. So the tag is a trailing text match, or an undefined reference after a
 * space.
 */
function splitTrailingTag(children: MdNode[], defined: Set<string>): Split | null {
	const last = children.at(-1);
	if (last?.type === 'text') {
		const match = TRAILING_TAG.exec(last.value ?? '');
		if (!match) return null;
		const text = last.value!.slice(0, match.index);
		return {
			children: text ? [...children.slice(0, -1), { ...last, value: text }] : children.slice(0, -1),
			tag: match[1]
		};
	}
	const reference = last as
		(MdNode & { referenceType?: string; identifier?: string; label?: string }) | undefined;
	if (reference?.type !== 'linkReference' || defined.has(reference.identifier ?? '')) return null;
	// `[New] [Preview]` is one full reference, `[New]` with the label `Preview`.
	const full = reference.referenceType === 'full';
	const tag = full ? reference.label : reference.children?.[0]?.value;
	if (!tag || !HEADING_TAGS.has(tag) || (!full && reference.children?.length !== 1)) return null;
	const before = children.at(-2);
	if (before?.type !== 'text' || !/\s$/.test(before.value ?? '')) return null;
	const text = full
		? `${before.value}[${reference.children!.map(textOf).join('')}]`
		: before.value!;
	return {
		children: text.trim()
			? [...children.slice(0, -2), { ...before, value: text.trimEnd() }]
			: children.slice(0, -2),
		tag
	};
}

const hasVisibleContent = (children: MdNode[]) =>
	children.some((child) => child.type !== 'text' || Boolean(child.value?.trim()));

/**
 * Base UI's `remarkHeadingTags`. Pulls one trailing `[New]` or `[Preview]` off a heading. The word
 * is removed from the heading text, which the slug and the quick nav are built from, and stored on
 * `data-heading-badge` for the heading to render as a badge.
 */
export function headingTags() {
	return (tree: MdNode) => {
		const defined = new Set(
			(tree.children ?? [])
				.filter((node) => node.type === 'definition')
				.map((node) => (node as { identifier?: string }).identifier ?? '')
		);
		const visit = (node: MdNode) => {
			if (node.type === 'heading' && node.children) {
				const split = splitTrailingTag(node.children, defined);
				if (split && hasVisibleContent(split.children)) {
					node.children = split.children;
					const hProperties = node.data?.hProperties as Record<string, unknown> | undefined;
					node.data = {
						...node.data,
						hProperties: { ...hProperties, 'data-heading-badge': split.tag }
					};
				}
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}
