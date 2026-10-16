import { dirname, relative, resolve } from 'node:path';
import type { MdNode } from './headings.ts';

/**
 * Base UI's `transformMarkdownRelativePaths`: a link to a page file, such as
 * `./accordion/+page.md` in a section index, becomes the page's URL, `/components/accordion`.
 * The links still resolve when the markdown is read on GitHub.
 */
export function relativePaths({ routes }: { routes: string }) {
	return () => (tree: MdNode, file: { filename?: string }) => {
		const visit = (node: MdNode) => {
			if (node.type === 'link' && node.url && /^\.\.?\//.test(node.url) && file.filename) {
				const target = relative(routes, resolve(dirname(file.filename), node.url));
				node.url = `/${target}`
					.replace(/\/\+page\.md(?=#|$)/, '')
					.split('/')
					.filter((segment) => !/^\(.+\)$/.test(segment))
					.join('/');
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}
