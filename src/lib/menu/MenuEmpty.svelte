<!--
	A message shown when the menu has no matching items. Requires the menu to be wrapped in
	`Menu.FilterProvider`. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/empty/MenuEmpty.tsx,
	packages/react/src/filter-dropdown/empty/FilterDropdownEmpty.tsx and
	packages/react/src/internals/useInitialLiveRegionTextMutation.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { ScopedTimeout, platform } from '@sveltery/utils';
	import { mergeProps } from '../internal/mergeProps.js';
	import { useMenuFilterPart } from './filter-part.js';
	import type { MenuEmptyProps, MenuEmptyState } from './types.js';

	let { render, children, ...elementProps }: MenuEmptyProps = $props();

	const { filter } = useMenuFilterPart('Empty');
	const liveKey = createAttachmentKey();

	// Items register in effects after this part's first render, and not at all on the server.
	// Deciding once they have keeps the message out of server markup and off every open.
	let ready = $state(false);
	onMount(() => {
		ready = true;
	});
	const resetTimeout = new ScopedTimeout();

	// Word Joiner is invisible and zero-width, so it forces a text mutation without layout shift.
	const LIVE_REGION_MARKER = '\u2060';
	// Safari VoiceOver needs about 200ms to notice the initial polite live-region change.
	const RESET_DELAY = 200;

	/** Marks the initial text once, so screen readers announce a region that mounts with text. */
	function announceInitialText(node: HTMLElement) {
		if (platform.os.ios) return;
		const walker = node.ownerDocument.createTreeWalker(node, NodeFilter.SHOW_TEXT);
		let text: Text | null = null;
		while (walker.nextNode()) {
			const current = walker.currentNode as Text;
			if (current.nodeValue !== '') text = current;
		}
		if (text == null) return;
		const original = text.data;
		const marked = `${original}${LIVE_REGION_MARKER}`;
		text.nodeValue = marked;
		const restore = () => {
			if (text.nodeValue === marked) text.nodeValue = original;
		};
		resetTimeout.start(RESET_DELAY, restore);
		return () => {
			resetTimeout.clear();
			restore();
		};
	}

	const partState: MenuEmptyState = {};
	const hostProps = $derived(
		mergeProps(
			{
				role: 'status' as const,
				'aria-live': 'polite' as const,
				'aria-atomic': true as const,
				[liveKey]: announceInitialText
			},
			elementProps
		)
	);
</script>

{#if ready && filter.isEmpty}
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
{/if}
