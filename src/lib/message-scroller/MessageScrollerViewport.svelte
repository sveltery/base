<!--
	The scrollable, focusable transcript region.
	Renders a `<div>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/message-scroller/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getMessageScroller } from './scroller.svelte.js';
	import type { MessageScrollerViewportProps } from './types.js';

	let {
		preserveScrollOnPrepend = true,
		role = 'region',
		'aria-label': ariaLabel = 'Messages',
		tabindex = 0,
		children,
		...rest
	}: MessageScrollerViewportProps = $props();
	const scroller = getMessageScroller();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...rest}
	{role}
	aria-label={ariaLabel}
	{tabindex}
	{...scroller.stateAttributes}
	{@attach scroller.viewport(() => preserveScrollOnPrepend)}
>
	{@render children?.()}
</div>
