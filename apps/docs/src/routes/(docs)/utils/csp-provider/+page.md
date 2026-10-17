# CSP Provider

<Subtitle>
  Configures CSP-related behavior for inline tags rendered by Sveltery Base components.
</Subtitle>

<Meta name="description" content="Configures CSP-related behavior for inline tags rendered by Sveltery Base components." />

## Anatomy

Import the component and wrap it around your app:

```svelte title="Anatomy"
<script lang="ts">
	import { CSPProvider } from '@sveltery/base/csp-provider';
</script>

<CSPProvider nonce="...">
	<!-- Your app or a group of components -->
</CSPProvider>
```

Some Sveltery Base components render inline `<style>` or `<script>` tags for functionality such as removing scrollbars or pre-hydration behavior. Under a strict Content Security Policy (CSP), these tags may be blocked unless they include a matching [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) attribute.

`CSPProvider` allows configuring this behavior globally for all Sveltery Base components within its tree.

## Supplying a nonce

If you enforce a CSP that blocks inline tags by default, configure your server to:

1. Generate a random nonce per request
2. Include it in your CSP header (via `style-src-elem`/`script-src`)
3. Pass the same nonce into `CSPProvider` during rendering

In SvelteKit, generate the nonce and set the header in `hooks.server.ts`:

```ts title="Example"
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const nonce = crypto.randomUUID();
	event.locals.nonce = nonce;

	const response = await resolve(event);
	// Example CSP header
	const csp = [
		`default-src 'self'`,
		`script-src 'self' 'nonce-${nonce}'`,
		`style-src-elem 'self' 'nonce-${nonce}'`
	].join('; ');
	response.headers.set('content-security-policy', csp);
	return response;
};
```

Then return the nonce from a layout `load` function and pass it to the provider:

```ts title="src/routes/+layout.server.ts"
export const load = ({ locals }) => ({ nonce: locals.nonce });
```

```svelte title="Providing the nonce"
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { CSPProvider } from '@sveltery/base/csp-provider';

	let { data, children } = $props();
</script>

<CSPProvider nonce={data.nonce}>
	{@render children()}
</CSPProvider>
```

This will ensure that all inline `<style>` and `<script>` tags rendered by Sveltery Base components include the correct nonce attribute, allowing them to function under your CSP.

## Disable inline style elements

You can avoid supplying a `nonce` if you disable inline `<style>` elements entirely and rely on external stylesheets only. The relevant components are `<ScrollArea.Root>` and `<Select.Popup>`. They inject a style tag that disables native scrollbars on `<ScrollArea.Viewport>`, and on `<Select.Popup>` or `<Select.List>` when `alignItemWithTrigger` is enabled.

```html
<style>
	.base-ui-disable-scrollbar {
		scrollbar-width: none;
	}
	.base-ui-disable-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
```

Specify `disableStyleElements` to remove these tags:

```svelte title="Disabling style elements"
<CSPProvider disableStyleElements>
	<!-- ... -->
</CSPProvider>
```

`<script>` tags across all components are opt-in, so they are not affected by this prop and don't have their own disable flag. A `nonce` is required if any component uses inline scripts.

## Inline style attributes

`CSPProvider` covers inline `<style>` and `<script>` tags rendered as elements, but it does not cover inline style attributes (for example, `<div style="...">`). The `style-src-attr` directive in CSP governs inline style attributes encountered when parsing HTML from server-rendered components (it does not affect client-side JavaScript that sets styles).

In CSP, `style-src` applies to both `<style>` elements and `style=""` attributes. If you only want to control `<style>` elements, use `style-src-elem` instead.

If your CSP blocks inline style _attributes_ in addition to _elements_, you have a few options:

1. Relax your CSP by adding `'unsafe-inline'` to the `style-src-attr` directive (or using only `style-src-elem` instead of `style-src`). Style attributes specifically pose a less severe security risk than style elements, but this approach may not be acceptable in high-security environments.
2. Render the affected components only on the client, so that no inline styles are present in the initial HTML.
3. Manually unset inline styles and specify them in your CSS instead. A part's `style` prop is merged into its own inline styles, so it cannot remove them. Use the part's `render` snippet and drop `style` from the props it receives. Note that you'll need to ensure you vet upgrades for any new inline styles added by Sveltery Base components.

```svelte
<ScrollArea.Viewport class="viewport">
	{#snippet render(props, state, children)}
		<div {...props} style={undefined}>{@render children?.()}</div>
	{/snippet}
</ScrollArea.Viewport>
```

## API reference

<script>
	import { TypesCSPProvider } from './types';
</script>

<TypesCSPProvider />
