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
3. Add an `<ApiPart>` for each part under `## API reference`.
4. Run `pnpm --filter @sveltery/base-docs check`. It fails if a demo does not compile or type-check, if a component page has no `<ApiPart>`, or if a folder the page documents has a part without one.

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

Bind `open` with `bind:open`. There is no `defaultOpen` prop.

## API reference

### Root

<ApiPart name="collapsible" part="Root" />
````

## Title and description

A page has no frontmatter. It starts the way a Base UI page does, and the build reads its metadata from the markdown, as Base UI's `transformMarkdownMetadata` does:

- The first `#` heading is the page title. The `<title>` adds ` · Sveltery Base`.
- `<Subtitle>` is the lead paragraph under the title. It can use inline code and links.
- `<Meta name="description" content="..." />` is the meta description. It renders nothing. Without it, the description is the subtitle. The build fails when it is longer than 170 characters.
- The `##` and deeper headings are the page's sections.

A page's position in the sidebar comes from `ORDER` in `src/lib/docs/content.server.ts`. Pages it doesn't list sort by title after the listed ones.

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

`<ApiPart name="<folder>" part="<Part>" />` renders one part's props and state. `name` is the folder in `src/lib`. `part` is the name after the dot, such as `Root` for `Collapsible.Root`, or the export name for a part without a namespace, such as `Button`.

The build reads the tables from the component types:

- The part list comes from the folder's `index.ts`. A namespace object such as `export const Collapsible = { Root, Trigger, Panel }` lists its parts. Otherwise each exported `.svelte` component is a part.
- The props come from the type in the component's `$props()` annotation. Only props declared in the library are listed. Inherited HTML attributes are left out.
- A prop's description and `@default` come from its doc comment. Without a `@default` tag, the default comes from the `$props()` destructuring. A `$bindable()` prop is marked bindable.
- The state comes from the type with the same name ending in `State`, such as `CollapsibleRootState`.
- The part description comes from the comment at the top of the `.svelte` file.
- A `children` prop is left out when its type is a plain `Snippet` with no doc comment. A `children` snippet with arguments, such as `Meter.Value`'s, is listed.
- A private type alias, such as a local `PartRender`, is shown expanded, so the Type column names only types a consumer can import.

To change a table, change the doc comment in `src/lib`.

## Components you can use

These need no import:

| Component                      | Use                                     |
| ------------------------------ | --------------------------------------- |
| `<ApiPart name="..." part="">` | The generated props and state of a part |
| `<Subtitle>`                   | The lead paragraph under the title      |

## Sections

A page's sidebar section is its folder under `src/routes/(docs)`: `overview`, `handbook`, `components`, or `utils`. To add a section, add its folder to `SECTIONS` in `src/lib/docs/content.server.ts`.
