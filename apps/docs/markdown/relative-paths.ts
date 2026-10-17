import { dirname, relative, resolve } from 'node:path';
import type { MdNode } from './headings.ts';

const PAGE_FILE = /\/\+page\.(svelte|md)(\?[^#]*)?(#.*)?$/;

/**
 * Base UI's `transformMarkdownRelativePaths`. A link to a page file, such as `./accordion/+page.md`
 * in a section index, becomes the page's URL, `/components/accordion`. A relative link resolves
 * against the page's folder, and route groups such as `(docs)` drop out. The links still resolve
 * when the markdown is read on GitHub.
 */
export function relativePaths({ routes }: { routes: string }) {
	return () => (tree: MdNode, file: { filename?: string }) => {
		const visit = (node: MdNode) => {
			if (node.type === 'link' && node.url && !/^[a-z][a-z\d+\-.]*:/i.test(node.url)) {
				let url = node.url.replace(PAGE_FILE, '$2$3');
				if (/^\.\.?\//.test(url) && file.filename)
					url = `/${relative(routes, resolve(dirname(file.filename), url))}`;
				node.url = url
					.split('/')
					.filter((segment) => !/^\(.+\)$/.test(segment))
					.join('/')
					.replace(/(.)\/$/, '$1');
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}
