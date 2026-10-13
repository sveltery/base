---
title: CSP Provider
description: Configures how the inline style and script tags that Sveltery Base components render handle a Content Security Policy.
---

```svelte demo
<script lang="ts">
	import { CSPProvider } from '@sveltery/base/csp-provider';
	import { ScrollArea } from '@sveltery/base/scroll-area';

	let disableStyleElements = $state(false);
	let container = $state<HTMLElement | null>(null);
	let styleCount = $state(0);

	$effect(() => {
		const element = container;
		if (!element) return;
		const update = () => (styleCount = element.querySelectorAll('style').length);
		update();
		const observer = new MutationObserver(update);
		observer.observe(element, { childList: true, subtree: true });
		return () => observer.disconnect();
	});
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={disableStyleElements} />
		Set <code>disableStyleElements</code>
	</label>
	<div bind:this={container} class="w-64">
		<CSPProvider nonce="demo-nonce" {disableStyleElements}>
			<ScrollArea.Root
				class="h-20 rounded-md outline outline-1 -outline-offset-1 outline-gray-200 dark:outline-gray-700"
			>
				<ScrollArea.Viewport class="h-full rounded-md">
					<ScrollArea.Content class="p-3">
						<p>Line one</p>
						<p>Line two</p>
						<p>Line three</p>
						<p>Line four</p>
						<p>Line five</p>
					</ScrollArea.Content>
				</ScrollArea.Viewport>
			</ScrollArea.Root>
		</CSPProvider>
	</div>
	<p>Inline <code>&lt;style&gt;</code> elements rendered: {styleCount}</p>
</div>
```

## Usage

Some components render inline tags. The scroll area renders a `<style>` element that hides the native scrollbars. A slider with `thumbAlignment="edge"` renders a `<script>` that runs before hydration. A strict Content Security Policy (CSP) blocks these tags unless they carry a matching nonce. `CSPProvider` passes one nonce to all of them.

To use it with a strict CSP:

1. Generate a random nonce for each request on your server.
2. Add that nonce to your CSP header for `style-src-elem` and `script-src`.
3. Pass the same nonce to `CSPProvider` when rendering.

```svelte
<script lang="ts">
	import { CSPProvider } from '@sveltery/base/csp-provider';

	let { nonce, children } = $props();
</script>

<CSPProvider {nonce}>
	{@render children?.()}
</CSPProvider>
```

## Anatomy

Import the component and wrap your app or a section of it:

```svelte
<script lang="ts">
	import { CSPProvider } from '@sveltery/base/csp-provider';
</script>

<CSPProvider nonce="...">
	<!-- Your app or a group of components -->
</CSPProvider>
```

## Examples

### Supply a nonce for a strict CSP

Generate the nonce for each request and put it in both the header and the provider. In SvelteKit, create the nonce in `hooks.server.ts`, send it to the layout, and pass it to the provider.

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const nonce = crypto.randomUUID();
	event.locals.nonce = nonce;

	const response = await resolve(event);
	response.headers.set(
		'content-security-policy',
		[
			`default-src 'self'`,
			`script-src 'self' 'nonce-${nonce}'`,
			`style-src-elem 'self' 'nonce-${nonce}'`
		].join('; ')
	);
	return response;
};
```

```ts
// src/routes/+layout.server.ts
export const load = ({ locals }) => ({ nonce: locals.nonce });
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { CSPProvider } from '@sveltery/base/csp-provider';

	let { data, children } = $props();
</script>

<CSPProvider nonce={data.nonce}>
	{@render children()}
</CSPProvider>
```

### Disable inline style elements

If you serve all styles from external stylesheets, you can skip the nonce. Set `disableStyleElements` so components do not render inline `<style>` elements. Today the scroll area is the component that renders one. You must then supply the styles that the element carried through your own CSS.

```svelte
<CSPProvider disableStyleElements>
	<!-- Your app or a group of components -->
</CSPProvider>
```

Script tags are opt in and this prop does not control them. If a component renders an inline script, you need a `nonce`.

### Inline style attributes

`CSPProvider` does not cover inline `style` attributes on elements. A CSP controls them with `style-src-attr`, or with `style-src` if you use it for both elements and attributes. You have two options:

1. Allow inline style attributes in your CSP. This carries less risk than allowing inline style elements, but some high-security environments do not accept it.
2. Render the affected components only on the client, so the initial HTML has no inline styles.

## Differences from Base UI

- `nonce` and `disableStyleElements` are live props. Descendants read the current values, so a change applies without remounting.
- Outside a provider, the nonce is `undefined` and `disableStyleElements` is `false`. Inside a provider that omits `disableStyleElements`, the value is `undefined`, which also leaves style elements on.
- `ScrollArea.Root` renders the inline `<style>` element that hides the native scrollbars.
- Today the scroll area style element and the slider script read the provider. `Select` is not ported yet, so no select style element exists. `Tabs.Indicator` accepts `renderBeforeHydration` but renders no script.
- There is no public hook to read the CSP settings. Components read them internally.

## API reference

### CSPProvider

<ApiPart name="csp-provider" part="CSPProvider" />

The provider renders no element, so it has no data attributes or CSS variables.
