<!--
	One transcript row: a message, marker, typing row, separator or load-more row.
	Renders a `<div>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/message-scroller/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getMessageScroller } from './scroller.svelte.js';
	import type { MessageScrollerItemProps } from './types.js';

	let { messageId, scrollAnchor = false, children, ...rest }: MessageScrollerItemProps = $props();
	const scroller = getMessageScroller();
</script>

<div
	data-message-id={messageId}
	data-scroll-anchor={scrollAnchor ? 'true' : 'false'}
	{...rest}
	{@attach scroller.item(messageId)}
>
	{@render children?.()}
</div>
