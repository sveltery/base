# Accordion

<Subtitle>
  A set of collapsible panels with headings.
</Subtitle>

<Meta name="description" content="A set of collapsible panels with headings." />

```svelte demo
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root
	class="flex w-full max-w-80 flex-col border border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
>
	<Accordion.Item>
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				What is Base UI?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">
				Base UI is a library of high-quality unstyled Svelte components for design systems and web
				apps.
			</div>
		</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item class="border-t border-neutral-950 dark:border-white">
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				How do I get started?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">
				Head to the “Quick start” guide in the docs. If you’ve used unstyled libraries before,
				you’ll feel at home.
			</div>
		</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item class="border-t border-neutral-950 dark:border-white">
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				Can I use it for my project?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">Of course! Base UI is free and open source.</div>
		</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>

{#snippet plus()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		class="block shrink-0 transition-transform duration-100 ease-[ease-out] group-data-panel-open:rotate-45"
	>
		<path d="M1.5 8h13M8 14.5v-13" />
	</svg>
{/snippet}
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root>
	<Accordion.Item>
		<Accordion.Header>
			<Accordion.Trigger />
		</Accordion.Header>
		<Accordion.Panel />
	</Accordion.Item>
</Accordion.Root>
```

## Examples

### Open multiple panels

You can set up the accordion to allow multiple panels to be open at the same time using the `multiple` prop.

```svelte demo
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root
	multiple
	class="flex w-full max-w-80 flex-col border border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
>
	<Accordion.Item>
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				What is Base UI?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">
				Base UI is a library of high-quality unstyled Svelte components for design systems and web
				apps.
			</div>
		</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item class="border-t border-neutral-950 dark:border-white">
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				How do I get started?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">
				Head to the “Quick start” guide in the docs. If you’ve used unstyled libraries before,
				you’ll feel at home.
			</div>
		</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item class="border-t border-neutral-950 dark:border-white">
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				Can I use it for my project?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">Of course! Base UI is free and open source.</div>
		</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>

{#snippet plus()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		class="block shrink-0 transition-transform duration-100 ease-[ease-out] group-data-panel-open:rotate-45"
	>
		<path d="M1.5 8h13M8 14.5v-13" />
	</svg>
{/snippet}
```

### Hidden until found

The `hiddenUntilFound` prop hides closed panels with [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) so the browser can search their contents and reveal the matching panel automatically. It can be set on each `Accordion.Panel`, or once on `Accordion.Root` to apply to all panels.

To try it, press <kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>Cmd</kbd>+<kbd>F</kbd> on macOS) and search for "restocking"—the browser opens the closed panel containing the match. When `hiddenUntilFound` is enabled, closed panels always remain mounted in the DOM, which also makes their contents indexable by search engines.

Older browsers that don't support `hidden="until-found"` keep panels hidden until their trigger opens them, and find-in-page skips over the contents.

```svelte demo
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root
	hiddenUntilFound
	class="flex w-full max-w-80 flex-col border border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
>
	<Accordion.Item>
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				How long does shipping take?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">
				Standard shipping takes 3–5 business days. Express delivery arrives in 1–2 business days.
			</div>
		</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item class="border-t border-neutral-950 dark:border-white">
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				What is your return policy?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">
				You can return any item within 30 days of delivery. Opened items may be subject to a 10%
				restocking fee.
			</div>
		</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item class="border-t border-neutral-950 dark:border-white">
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				Do you ship internationally?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">
				Yes, we ship to over 40 countries. International orders typically arrive within 7–14
				business days.
			</div>
		</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item class="border-t border-neutral-950 dark:border-white">
		<Accordion.Header>
			<Accordion.Trigger
				class="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:not-data-disabled:bg-neutral-800"
			>
				How can I track my order?
				{@render plus()}
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel
			class="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
		>
			<div class="px-3 py-2">
				Once your order ships, you’ll receive a tracking link by email. Tracking updates can take up
				to 24 hours to appear.
			</div>
		</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>

{#snippet plus()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		class="block shrink-0 transition-transform duration-100 ease-[ease-out] group-data-panel-open:rotate-45"
	>
		<path d="M1.5 8h13M8 14.5v-13" />
	</svg>
{/snippet}
```

## API reference

<script>
	import { TypesAccordion } from './types';
</script>

### Root

<TypesAccordion.Root />

### Item

<TypesAccordion.Item />

### Header

<TypesAccordion.Header />

### Trigger

<TypesAccordion.Trigger />

### Panel

<TypesAccordion.Panel />
