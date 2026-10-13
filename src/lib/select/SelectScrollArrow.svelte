<!--
	Scrolls the select list while the pointer rests on it. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/scroll-arrow/SelectScrollArrow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Internal: `Select.ScrollUpArrow` and `Select.ScrollDownArrow` pass the direction.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ScopedTimeout } from '@sveltery/utils';
	import { mergeProps } from '../internal/mergeProps.js';
	import { normalizeScrollOffset } from '../internal/scrollEdges.js';
	import {
		getStateAttributesProps,
		transitionStatusMapping
	} from '../internal/state-attributes.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import { useSelectPositioner, useSelectRoot } from './context.svelte.js';
	import { getMaxScrollOffset, getTargetScrollTop } from './popup-utils.js';
	import type { SelectScrollArrowProps, SelectScrollArrowState } from './types.js';

	let {
		direction,
		keepMounted = false,
		render,
		children,
		...elementProps
	}: SelectScrollArrowProps & { direction: 'up' | 'down' } = $props();

	const store = useSelectRoot();
	const positioner = useSelectPositioner();
	const bindKey = createAttachmentKey();
	const timeout = new ScopedTimeout();

	const isUp = $derived(direction === 'up');
	// Scroll arrows are hover-only, so touch never shows them.
	const visible = $derived(
		(isUp ? store.scrollUpArrowVisible : store.scrollDownArrowVisible) &&
			store.renderedOpenMethod !== 'touch'
	);

	const transition = new TransitionStatus(() => visible);
	let node = $state<HTMLElement | null>(null);
	transition.unmountAfterExit(() => node);

	$effect(() => {
		untrack(() => (store.scrollArrowCount += 1));
		return () => {
			untrack(() => (store.scrollArrowCount = Math.max(0, store.scrollArrowCount - 1)));
		};
	});

	function bindArrow(element: HTMLElement) {
		node = element;
		return () => {
			if (node === element) node = null;
		};
	}

	function scrollNextItem() {
		const scroller = store.listElement ?? store.popupElement;
		if (!scroller) return;

		store.activeIndex = null;
		store.handleScrollArrowVisibility(scroller);

		const maxScrollTop = getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight);
		const scrollTop = normalizeScrollOffset(scroller.scrollTop, maxScrollTop);
		if (scrollTop !== scroller.scrollTop) scroller.scrollTop = scrollTop;

		if (scrollTop === (isUp ? 0 : maxScrollTop)) {
			timeout.clear();
			return;
		}

		const items = store.items.elements;
		if (items.length > 0) {
			scroller.scrollTop = getTargetScrollTop(
				items,
				isUp,
				scrollTop,
				scroller.clientHeight,
				node?.offsetHeight || 0,
				maxScrollTop
			);
		}

		timeout.start(40, scrollNextItem);
	}

	const partState: SelectScrollArrowState = $derived({
		direction,
		visible,
		side: positioner.side,
		transitionStatus: transition.transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				'aria-hidden': true as const,
				style: 'position: absolute',
				onmousemove(event: MouseEvent) {
					if ((event.movementX === 0 && event.movementY === 0) || timeout.isStarted()) return;
					store.activeIndex = null;
					timeout.start(40, scrollNextItem);
				},
				onmouseleave() {
					timeout.clear();
				},
				...getStateAttributesProps(partState, transitionStatusMapping),
				[bindKey]: bindArrow
			},
			elementProps
		)
	);
</script>

{#snippet arrow()}{isUp ? '▲' : '▼'}{/snippet}

{#if transition.mounted || keepMounted}
	{#if render}
		{@render render(hostProps, partState, children ?? arrow)}
	{:else}
		<div {...hostProps}>{@render (children ?? arrow)()}</div>
	{/if}
{/if}
