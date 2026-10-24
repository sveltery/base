<!--
	The frame around the viewport. It mirrors the viewport's scroll-state attributes.
	Renders a `<div>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/message-scroller/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getMessageScroller } from './scroller.svelte.js';
	import type { MessageScrollerRootProps } from './types.js';

	let { children, ...rest }: MessageScrollerRootProps = $props();
	const scroller = getMessageScroller();
</script>

<div {...rest} {...scroller.stateAttributes}>
	{@render children?.()}
</div>
