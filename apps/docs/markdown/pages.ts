import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** A docs page: `<routes>/<section>/<slug>/+page.md`, served at `/<section>/<slug>`. */
export type PageFile = { section: string; slug: string; href: string; path: string };

/** Every page under `routes`, the `(docs)` route group. Dynamic routes such as `[section]` are not pages. */
export const pageFiles = (routes: string): PageFile[] =>
	readdirSync(routes, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && !entry.name.startsWith('['))
		.flatMap(({ name: section }) =>
			readdirSync(join(routes, section))
				.map((slug) => ({ section, slug, path: join(routes, section, slug, '+page.md') }))
				.filter(({ path }) => existsSync(path))
				.map((page) => ({ ...page, href: `/${page.section}/${page.slug}` }))
		);
