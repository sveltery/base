import { hastText, headingRank, type HastNode } from './headings.ts';
import { stringToUrl } from './slug.ts';

/** The Forms page's library sections. Base UI's are React Hook Form and TanStack Form. */
const LIBRARIES = new Set(['Superforms', 'TanStack Form']);

/** The id an h3 under a Forms library's h2 takes, or undefined for any other heading. */
export const libraryHeadingId = (page: string, h2: string, h3: string) =>
	page === 'Forms' && LIBRARIES.has(h2) ? stringToUrl(`${h2} ${h3}`) : undefined;

/**
 * Base UI's `rehypeConcatHeadings`. On the Forms page, an h3 under a library's h2 gets the library's
 * name in its id, so `Submitting data` under TanStack Form is `#tanstack-form-submitting-data`.
 */
export function concatHeadings() {
	return (tree: HastNode) => {
		const nodes = tree.children ?? [];
		const title = nodes.find((node) => headingRank(node) === 1);
		if (!title) return;
		let h2: string | undefined;
		for (const node of nodes) {
			const depth = headingRank(node);
			if (depth === 2) h2 = hastText(node);
			const id = depth === 3 && h2 && libraryHeadingId(hastText(title), h2, hastText(node));
			if (id) node.properties!.id = id;
		}
	};
}
