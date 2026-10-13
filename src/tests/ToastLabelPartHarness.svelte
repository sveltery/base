<!--
	Toast.Title or Toast.Description inside a fixed Toast.Root, for the shared label-part specs.
	- `zero`: the part's children render the number 0.
	- `render`: a `render` snippet that spreads its props on a `<div>` and renders the children.
	- `render-empty`: a `render` snippet that renders nothing.
	- `clear`: the part has `id="part"` and children while `content` is true.
	- `parts`: an `old-part` and a `new-part` mount and unmount by `parts`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Toast, type ToastObject } from '#lib';

	let {
		part,
		scenario,
		toast = { id: 'test' },
		children: text = undefined,
		content = true,
		parts = 'old'
	}: {
		part: 'title' | 'description';
		scenario: 'zero' | 'render' | 'render-empty' | 'clear' | 'parts';
		toast?: ToastObject;
		/** Text children for the `render` scenarios. */
		children?: string;
		content?: boolean;
		parts?: 'old' | 'both' | 'new';
	} = $props();

	const Part = $derived(part === 'title' ? Toast.Title : Toast.Description);
</script>

{#snippet zero()}{0}{/snippet}
{#snippet textChildren()}{text}{/snippet}
{#snippet contentChildren()}Toast content{/snippet}
{#snippet renderDiv(props: object, _state: unknown, children: Snippet | undefined)}
	<div {...props} data-testid="part-render">{@render children?.()}</div>
{/snippet}
{#snippet renderNothing()}{/snippet}

<Toast.Provider>
	<Toast.Viewport>
		<Toast.Root {toast} data-testid="root">
			{#if scenario === 'zero'}
				<Part children={zero} />
			{:else if scenario === 'render'}
				<Part render={renderDiv} children={text === undefined ? undefined : textChildren} />
			{:else if scenario === 'render-empty'}
				<Part render={renderNothing} children={text === undefined ? undefined : textChildren} />
			{:else if scenario === 'clear'}
				<Part id="part" children={content ? contentChildren : undefined} />
			{:else}
				{#if parts !== 'new'}
					<Part id="old-part">Old</Part>
				{/if}
				{#if parts !== 'old'}
					<Part id="new-part">New</Part>
				{/if}
			{/if}
		</Toast.Root>
	</Toast.Viewport>
</Toast.Provider>
