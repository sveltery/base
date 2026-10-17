import type { MdNode } from './headings.ts';

type Definition = MdNode & { identifier?: string; title?: string | null };

/**
 * Base UI's `remarkQuickNavExcludeHeading`. The link definition `[//]: # '@exclude-table-of-contents'`
 * renders nothing, and marks the heading right after it with `data-exclude-toc`, which keeps that
 * heading and its subheadings out of the quick nav.
 */
export function excludeHeading() {
	return (tree: MdNode) => {
		const visit = (parent: MdNode) => {
			parent.children?.forEach((node: Definition, index) => {
				const next = parent.children![index + 1];
				if (
					node.type === 'definition' &&
					node.url === '#' &&
					node.identifier === '//' &&
					node.title === '@exclude-table-of-contents' &&
					next?.type === 'heading'
				) {
					const hProperties = next.data?.hProperties as Record<string, unknown> | undefined;
					next.data = { ...next.data, hProperties: { ...hProperties, 'data-exclude-toc': '' } };
				}
				visit(node);
			});
		};
		visit(tree);
	};
}
