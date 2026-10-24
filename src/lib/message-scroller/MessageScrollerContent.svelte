<!--
	The transcript log. Every direct child should be a `MessageScroller.Item`.
	Renders a `<div>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/message-scroller/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getMessageScroller } from './scroller.svelte.js';
	import type { MessageScrollerContentProps } from './types.js';

	let {
		spacerClass,
		role = 'log',
		'aria-relevant': ariaRelevant = 'additions',
		children,
		...rest
	}: MessageScrollerContentProps = $props();
	const scroller = getMessageScroller();
</script>

<div {...rest} {role} aria-relevant={ariaRelevant} {@attach scroller.content}>
	{@render children?.()}
	<div
		aria-hidden="true"
		data-message-scroller-spacer=""
		hidden
		class={spacerClass}
		{@attach scroller.spacer}
	></div>
</div>
