# Sveltery Base docs

The documentation site for `@sveltery/base`, built with SvelteKit and [mdsvex](https://github.com/pngwn/MDsveX). Its structure follows [base-ui.com](https://base-ui.com). The site reads the library from `src/lib` at the repository root, so it documents the checked-out code without a package build.

```bash
pnpm --filter @sveltery/base-docs dev     # http://localhost:5173
pnpm --filter @sveltery/base-docs build   # prerenders every page for Cloudflare
pnpm --filter @sveltery/base-docs check   # builds, then type-checks the site and every demo
```

`build` writes a Cloudflare Workers bundle to `.svelte-kit/cloudflare`. `wrangler.jsonc` describes the worker. The site is not deployed yet.

## Add a page

A page is one markdown file. Its path is its URL: `content/components/tooltip.md` is `/components/tooltip`. The sidebar, the previous and next links, and the table of contents pick it up. You do not edit a nav file.

To document a new component:

1. Create `content/components/<folder>.md`, where `<folder>` is the component's folder in `src/lib`.
2. Write the frontmatter, a hero demo, the anatomy, examples, and the differences from Base UI.
3. Add an `<ApiPart>` for each part under `## API reference`.
4. Run `pnpm --filter @sveltery/base-docs check`. It fails if a demo does not compile or type-check, if a component page has no `<ApiPart>`, or if a folder the page documents has a part without one.

````md
---
title: Collapsible
description: A collapsible panel controlled by a button.
---

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

## Frontmatter

| Field         | Required | Meaning                                                                                     |
| ------------- | -------- | ------------------------------------------------------------------------------------------- |
| `title`       | yes      | The page heading and the sidebar label                                                      |
| `description` | yes      | The lead paragraph and the meta description                                                 |
| `order`       | no       | The position in the sidebar section. Pages without it sort by title after the ordered pages |

The build fails when a page has no `title` or `description`.

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
| `<Callout title="...">`        | A highlighted note                      |

## Sections

A page's sidebar section is its folder: `overview`, `handbook`, `components`, or `utils`. To add a section, add its folder to `SECTIONS` in `src/lib/docs/content.server.ts`.
