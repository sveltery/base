<!--
	Scrolls to the start or end of the transcript. It is inert and out of the tab order
	while there is nothing to scroll toward.
	Renders a `<button>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/message-scroller/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getMessageScroller } from './scroller.svelte.js';
	import type { MessageScrollerButtonProps } from './types.js';

	let {
		behavior = 'smooth',
		direction = 'end',
		type = 'button',
		tabindex,
		onclick,
		render,
		children,
		...rest
	}: MessageScrollerButtonProps = $props();
	const scroller = getMessageScroller();
	const active = $derived(scroller.scrollable[direction]);

	const buttonProps: HTMLButtonAttributes = $derived({
		type,
		inert: active ? undefined : true,
		tabindex: active ? tabindex : -1,
		...rest,
		'data-active': active ? 'true' : 'false',
		onclick: (event) => {
			if (!active) return;
			onclick?.(event);
			if (event.defaultPrevented) return;
			event.currentTarget.blur();
			if (direction === 'start') scroller.scrollToStart({ behavior });
			else scroller.scrollToEnd({ behavior });
		}
	});
</script>

{#if render}
	{@render render(buttonProps, { active, direction })}
{:else}
	<button {...buttonProps}>
		{#if children}{@render children()}{:else}<span>Scroll to {direction}</span>{/if}
	</button>
{/if}
