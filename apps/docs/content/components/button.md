---
title: Button
description: A button component that can be rendered as another tag or focusable when disabled.
---

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';
</script>

<Button
	class="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:active:bg-gray-700"
>
	Submit
</Button>
```

## Anatomy

Import the component and use it as a single part:

```svelte
<script lang="ts">
	import { Button } from '@sveltery/base/button';
</script>

<Button />
```

## Examples

### Handle clicks

Pass `onclick` as you would on a `<button>`. A disabled button does not run it.

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';

	let count = $state(0);
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Button
		onclick={() => count++}
		class="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3.5 font-medium select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		Like
	</Button>
	<span>{count} {count === 1 ? 'like' : 'likes'}</span>
</div>
```

### Disabled button

Set `disabled` to ignore user interaction. A native button gets the `disabled` attribute, so it leaves the tab order. Style it with the `data-[disabled]` variant.

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';
</script>

<Button
	disabled
	class="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3.5 font-medium text-gray-900 select-none data-[disabled]:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:data-[disabled]:text-gray-500"
>
	Submit
</Button>
```

### Focusable when disabled

Set `focusableWhenDisabled` to keep a disabled button in the tab order. A native button then uses `aria-disabled` instead of the `disabled` attribute. It still ignores clicks and key presses, except Tab.

Use this for a button that shows a loading state. Focus stays on the button while it is disabled. Point `aria-labelledby` at a `<span>` that holds the label, so the changing text becomes the accessible name. Some browser and screen reader combinations do not reliably announce a change to the text inside a focused button.

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';

	let loading = $state(false);

	function save() {
		loading = true;
		setTimeout(() => (loading = false), 1500);
	}
</script>

<Button
	disabled={loading}
	focusableWhenDisabled
	aria-labelledby="save-label"
	onclick={save}
	class="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3.5 font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[disabled]:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:data-[disabled]:text-gray-500"
>
	<span id="save-label">{loading ? 'Saving…' : 'Save'}</span>
</Button>
```

### Render as another tag

Use the `render` snippet to render another element. Set `nativeButton={false}` so the part adds `role="button"`, `tabindex`, and the keyboard behavior a native button has. Enter and Space then activate the element. Spread `props` onto it.

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';

	let count = $state(0);
</script>

<Button nativeButton={false} onclick={() => count++}>
	{#snippet render(props)}
		<div
			{...props}
			class="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3.5 font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
		>
			Clicked {count} times
		</div>
	{/snippet}
</Button>
```

### Rendering links as buttons

Do not render a link as a button with `render`. Links (`<a>`) have their own semantics. If a link needs button styling, style the `<a>` element with CSS.

## Differences from Base UI

- Button has no controlled or default state, so it has no `$bindable` prop. `disabled` and `focusableWhenDisabled` are plain props.
- Use `onclick` and the other lowercase handlers. The part skips them while the button is disabled. Call `event.preventDefault()` in `onkeydown` to stop the part from activating a non-native host on Enter or Space.
- Button has no change callback, so there is no `eventDetails.cancel()`.
- Parts take `class` and a `style` string, not functions of state. Style the disabled state with `data-[disabled]`.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- The part checks that the host matches `nativeButton` after it attaches, and when `nativeButton` changes. In development, it logs an error if a native button renders a non-`<button>` element or the reverse. The message names the `render` snippet.
- Button has no integration with a composite widget such as `Toolbar` yet. Use `Toolbar.Button` inside a toolbar.

## API reference

### Button

<ApiPart name="button" part="Button" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |
