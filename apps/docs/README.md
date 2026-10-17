# Sveltery Base docs

The documentation site for `@sveltery/base`, built with SvelteKit and [mdsvex](https://github.com/pngwn/MDsveX). Its structure follows [base-ui.com](https://base-ui.com). The site reads the library from `src/lib` at the repository root, so it documents the checked-out code without a package build.

```bash
pnpm --filter @sveltery/base-docs dev     # http://localhost:5173
pnpm --filter @sveltery/base-docs build   # prerenders every page for Cloudflare
pnpm --filter @sveltery/base-docs check   # builds, then type-checks the site and every demo
```

`build` writes a Cloudflare Workers bundle to `.svelte-kit/cloudflare`. `wrangler.jsonc` describes the worker, `sveltery-base-docs`. Cloudflare Workers Builds deploys it: it installs at the repository root, runs `pnpm build` in `apps/docs`, then `npx wrangler deploy` on `main` and `npx wrangler preview` on other branches.

## Add a page

A page is a route folder with one markdown file, as in Base UI's `docs/src/app/(docs)/react/<section>/<slug>/page.mdx`. Its path is its URL: `src/routes/(docs)/components/tooltip/+page.md` is `/components/tooltip`. The sidebar and the table of contents pick it up.

To document a new component:

1. Create `src/routes/(docs)/components/<folder>/+page.md`, where `<folder>` is the component's folder in `src/lib`.
2. Write the title, subtitle and description, a hero demo, the anatomy, examples, and the differences from Base UI.
3. Add a `types.ts` beside the page, and a `<TypesX.Part />` tag for each part under `## API reference`.
4. Run `pnpm --filter @sveltery/base-docs check`. It fails if a demo does not compile or type-check, if a component page has no `types.ts`, or if a part the `types.ts` documents has no tag on the page.

````md
# Collapsible

<Subtitle>
  A collapsible panel controlled by a button.
</Subtitle>

<Meta name="description" content="A collapsible panel controlled by a button." />

```svelte demo
<script lang="ts">
	import { Collapsible } from '@sveltery/base/collapsible';
</script>

<Collapsible.Root>
	<Collapsible.Trigger class="rounded-sm bg-gray-100 px-2 py-1">Recovery keys</Collapsible.Trigger>
	<Collapsible.Panel class="mt-2">alien-bean-pasta</Collapsible.Panel>
</Collapsible.Root>
```

## Anatomy

```svelte
<Collapsible.Root>
	<Collapsible.Trigger />
	<Collapsible.Panel />
</Collapsible.Root>
```

## Differences from Base UI

`class` takes a Svelte class value, not a function of state.

## API reference

<script>
	import { TypesCollapsible } from './types';
</script>

### Root

<TypesCollapsible.Root />
````

## Title and description

A page has no frontmatter. It starts the way a Base UI page does, and the build reads its metadata from the markdown, as Base UI's `transformMarkdownMetadata` does:

- The first `#` heading is the page title. The `<title>` adds ` · Sveltery Base`.
- `<Subtitle>` is the lead paragraph under the title. It can use inline code and links.
- `<Meta name="description" content="..." />` is the meta description. It renders nothing. Without it, the description is the subtitle. The build fails when it is longer than 170 characters.
- The `##` and deeper headings are the page's sections.

A page's position in the sidebar comes from its section index, `src/routes/(docs)/<section>/+page.md`. See [Sections](#sections).

## Demos

A fenced block with the language `svelte` and the word `demo` is a live demo:

````md
```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<Switch.Root />
```
````

The build writes the block to `dist/demos/<section>-<page>-<n>.svelte`, compiles it as its own component, and shows it above its highlighted source. `pnpm check` type-checks these files, so a demo that passes a wrong prop fails the check and names its page. Import the library as `@sveltery/base/<folder>`, the same way a consumer does. Style demos with Tailwind classes, with `dark:` variants for the dark theme. The block is the whole component, so it can have its own `<script>` and state. Any other fenced block is plain highlighted code.

## API reference

A page's `types.ts` names the library export it documents, as Base UI's does:

```ts
import { Collapsible } from '@sveltery/base/collapsible';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Collapsible);

export const TypesCollapsible = types;
```

`createMultipleTypes` documents a namespace's parts, and `<TypesCollapsible.Root />` renders one with its description. `createTypes` documents a single export, such as `Button`, without its description. To show the exported types no part documents, also take `AdditionalTypes` and render it, as `avatar` does. Each type is hidden until `showAdditionalTypes` names it or a link targets it.

The `docs-types` Vite plugin fills each `types.ts` from the component types, and writes a `types.md` beside it in Base UI's format. Commit it. `pnpm docs:validate` regenerates every `types.md`, and in CI it fails when one is out of date.

The build reads the tables from the component types:

- The part list comes from the folder's `index.ts`. A namespace object such as `export const Collapsible = { Root, Trigger, Panel }` lists its parts. Otherwise each exported `.svelte` component is a part.
- The props come from the type in the component's `$props()` annotation. Only props declared in the library are listed. Inherited HTML attributes are left out.
- A prop's description and `@default` come from its doc comment. Without a `@default` tag, the default comes from the `$props()` destructuring. A `$bindable()` prop is marked bindable.
- The state comes from the type with the same name ending in `State`, such as `CollapsibleRootState`.
- The part description comes from the comment at the top of the `.svelte` file.
- The data attributes and CSS variables come from the `<Part>DataAttributes` and `<Part>CssVariables` exports, such as `CollapsiblePanelDataAttributes`. Each constant's doc comment is its description, and its `@type` tag is its type.
- A `children` prop is left out when its type is a plain `Snippet` with no doc comment. A `children` snippet with arguments, such as `Meter.Value`'s, is listed.
- A private type alias, such as a local `PartRender`, is shown expanded, so the Type column names only types a consumer can import. A private union of literals or function type keeps its name, and `types.md` defines it under External Types.

To change a table, change the doc comment in `src/lib`.

## Components you can use

These need no import:

| Component    | Use                                |
| ------------ | ---------------------------------- |
| `<Subtitle>` | The lead paragraph under the title |

## Sections

A page's sidebar section is its folder under `src/routes/(docs)`: `overview`, `handbook`, `components`, or `utils`. Each section has an index page, `<section>/+page.md`, in Base UI's format, with three zones:

1. The list at the top. Its order is the sidebar order. You can edit the order, the titles and the `[Tag]`s, but not the links in parentheses. A `[New]` or `[Preview]` tag shows as a sidebar badge, and `- [llms.txt](/llms.txt) [External]` is a plain link.
2. The generated zone, after the "DO NOT EDIT AFTER THIS LINE" marker. It holds each page's title, subtitle and outline.
3. The tail, after the last marker, which you can edit.

A build or the dev server regenerates the index when a page changes, and a new page joins the end of the list with a `[New]` tag. Commit the result. `pnpm docs:validate` regenerates every index, and in CI it fails when one is out of date. An index lists each page's parts, props, data attributes and CSS variables from its `types.ts`. `virtual:sitemap` serves the indexes to the sidebar, the mobile nav, search and `/llms.txt`. To add a section, add its folder with an index page and add it to `sitemap({ sections })` in `vite.config.ts`.
