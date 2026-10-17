import { hastText, headingRank, type HastNode } from './headings.ts';

/**
 * Base UI's `rehypeSlug`, a fork of rehype-slug with github-slugger's dedupe. Gives each heading an
 * id from its text. The first heading with a slug keeps it, and later ones get `-1`, `-2` and so on.
 * An id set before this runs keeps its value and counts as taken.
 */
export function slug({ prefix = '' }: { prefix?: string } = {}) {
	return (tree: HastNode) => {
		const occurrences = new Map<string, number>();
		const visit = (node: HastNode) => {
			if (headingRank(node)) {
				if (node.properties!.id) occurrences.set(String(node.properties!.id), 0);
				else {
					const base = prefix + stringToUrl(hastText(node));
					let id = base;
					while (occurrences.has(id)) {
						occurrences.set(base, occurrences.get(base)! + 1);
						id = `${base}-${occurrences.get(base)}`;
					}
					occurrences.set(id, 0);
					node.properties!.id = id;
				}
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}

/**
 * Turns text into an id, spelling out common contractions:
 * `1. Here’s a wicked example & more.` becomes `1-here-is-a-wicked-example-and-more`.
 */
export function stringToUrl(value: string) {
	return value
		.replace(/([a-z])('|’|‘)ll([^a-z])/gi, '$1-will$3')
		.replace(/won('|’|‘)t([^a-z])/gi, 'will-not$2')
		.replace(/can('|’|‘)t([^a-z])/gi, 'cannot$2')
		.replace(/n('|’|‘)t([^a-z])/gi, '-not$2')
		.replace(/([a-z])('|’|‘)ve/gi, '$1-have')
		.replace(/([a-z])('|’|‘)re/gi, '$1-are')
		.replace(/(that|there|they)('|’|‘)d/gi, '$1-would')
		.replace(/(that|there|here)('|’|‘)s/gi, '$1-is')
		.replace(/([a-z])('|’|‘)s([^a-z])/gi, '$1s$3')
		.replace(/\s+|_|–|—|'|’|‘|"|“|”|\./gi, '-')
		.replace(/&/gi, '-and-')
		.replace(/[^a-z0-9-]/gi, '')
		.replace(/-+/gi, '-')
		.replace(/^-|-$/gi, '')
		.toLowerCase();
}
