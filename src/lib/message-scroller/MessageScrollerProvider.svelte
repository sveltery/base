<!--
	Owns the scroll state and the behavior props, and provides them to the parts and
	`getMessageScroller()`. Doesn't render its own HTML element.
	Derived from @shadcn/react v0.3.1 packages/react/src/message-scroller/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { MessageScrollerController, setMessageScrollerContext } from './scroller.svelte.js';
	import type { MessageScrollerProviderProps } from './types.js';

	let {
		autoScroll = false,
		defaultScrollPosition = 'end',
		scrollEdgeThreshold = 8,
		scrollPreviousItemPeek = 64,
		scrollMargin = 0,
		children
	}: MessageScrollerProviderProps = $props();

	const scroller = setMessageScrollerContext(
		new MessageScrollerController({
			get autoScroll() {
				return autoScroll;
			},
			get defaultScrollPosition() {
				return defaultScrollPosition;
			},
			get scrollEdgeThreshold() {
				return scrollEdgeThreshold;
			},
			get scrollPreviousItemPeek() {
				return scrollPreviousItemPeek;
			},
			get scrollMargin() {
				return scrollMargin;
			}
		})
	);

	$effect(() => scroller.openAt(defaultScrollPosition));
	$effect(() => scroller.autoScrollChanged(autoScroll));
</script>

{@render children?.()}
