<!--
	A container for the select list. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/popup/SelectPopup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	With `alignItemWithTrigger` the popup measures itself and writes the positioner's height and
	offsets. Those writes go to the store's aligned style records, which the parts render, because
	Svelte replaces the whole `style` attribute when a part's style changes.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import type { HTMLAttributes } from 'svelte/elements';
	import { FloatingFocusManager } from '@sveltery/floating-ui-svelte';
	import {
		createChangeEventDetails,
		ownerDocument,
		ownerWindow,
		platform,
		REASONS,
		ScopedAnimationFrame
	} from '@sveltery/utils';
	import { clamp } from '../internal/clamp.js';
	import { COMPOSITE_KEYS } from '../internal/composite-keys.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { useCSPContext } from '../internal/csp-context.js';
	import { useDirection } from '../internal/direction-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { SCROLL_EDGE_TOLERANCE_PX } from '../internal/scrollEdges.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { DISABLE_SCROLLBAR_CLASS, DISABLE_SCROLLBAR_CSS } from '../internal/styles.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { useSelectPositioner, useSelectRoot } from './context.svelte.js';
	import {
		getMaxPopupHeight,
		getMaxScrollTop,
		getScale,
		LIST_FUNCTIONAL_STYLES,
		normalizeRect,
		normalizeSize,
		unsetTransformStyles
	} from './popup-utils.js';
	import type { SelectPopupProps, SelectPopupState } from './types.js';

	let { finalFocus = undefined, render, children, ...elementProps }: SelectPopupProps = $props();

	const TRANSFORM_ORIGIN_VAR = '--transform-origin';

	const store = useSelectRoot();
	const positioner = useSelectPositioner();
	const direction = useDirection();
	const csp = useCSPContext();
	const bindKey = createAttachmentKey();
	const scrollArrowFrame = new ScopedAnimationFrame();

	let reachedMaxHeight = false;
	let initialPlaced = false;

	function handleScroll(scroller: HTMLElement) {
		const positionerElement = store.positionerElement;
		const popupElement = store.popupElement;
		if (!positionerElement || !popupElement || !initialPlaced) return;

		const isTopPositioned = positionerElement.style.top === '0px';
		const isBottomPositioned = positionerElement.style.bottom === '0px';

		if (
			reachedMaxHeight ||
			!positioner.alignItemWithTriggerActive ||
			(!isTopPositioned && !isBottomPositioned)
		) {
			store.handleScrollArrowVisibility(scroller);
			return;
		}

		const scale = getScale(positionerElement);
		const currentHeight = normalizeSize(
			positionerElement.getBoundingClientRect().height,
			'y',
			scale
		);
		const doc = ownerDocument(positionerElement);
		const win = ownerWindow(positionerElement);
		const positionerStyles = win.getComputedStyle(positionerElement);
		const marginTop = parseFloat(positionerStyles.marginTop);
		const marginBottom = parseFloat(positionerStyles.marginBottom);
		const maxPopupHeight = getMaxPopupHeight(win.getComputedStyle(popupElement));
		const maxAvailableHeight = Math.min(
			doc.documentElement.clientHeight - marginTop - marginBottom,
			maxPopupHeight
		);

		const scrollTop = scroller.scrollTop;
		const maxScrollTop = getMaxScrollTop(scroller);
		// `Infinity` requests a scroll to the recomputed maximum offset.
		let nextScrollTop: number | null = null;

		const setHeight = (height: number) =>
			store.writeAlignedStyles('positioner', { height: `${height}px` });

		const diff = isTopPositioned ? maxScrollTop - scrollTop : scrollTop;
		const nextHeight = Math.min(currentHeight + diff, maxAvailableHeight);

		if (diff <= SCROLL_EDGE_TOLERANCE_PX) {
			const heightDelta = clamp(diff, 0, maxAvailableHeight - currentHeight);
			// Consume the remaining scroll in height.
			if (heightDelta > 0) setHeight(currentHeight + heightDelta);
			scroller.scrollTop = isTopPositioned ? maxScrollTop : 0;
			if (maxAvailableHeight - (currentHeight + heightDelta) <= SCROLL_EDGE_TOLERANCE_PX) {
				reachedMaxHeight = true;
			}
			store.handleScrollArrowVisibility(scroller);
			return;
		}

		if (maxAvailableHeight - nextHeight > SCROLL_EDGE_TOLERANCE_PX) {
			nextScrollTop = isTopPositioned ? Infinity : 0;
		} else if (isBottomPositioned && scrollTop < maxScrollTop) {
			const overshoot = currentHeight + diff - maxAvailableHeight;
			nextScrollTop = scrollTop - (diff - overshoot);
		}

		const nextPositionerHeight = Math.ceil(nextHeight);
		if (nextPositionerHeight !== 0) setHeight(nextPositionerHeight);

		if (nextScrollTop != null) {
			// The resize changed the bounds.
			const target = clamp(nextScrollTop, 0, getMaxScrollTop(scroller));
			// Small adjustments would fire scroll events forever.
			if (Math.abs(scroller.scrollTop - target) > SCROLL_EDGE_TOLERANCE_PX) {
				scroller.scrollTop = target;
			}
		}

		if (nextPositionerHeight >= maxAvailableHeight - SCROLL_EDGE_TOLERANCE_PX) {
			reachedMaxHeight = true;
		}

		store.handleScrollArrowVisibility(scroller);
	}

	store.scrollHandler = handleScroll;
	$effect(() => () => {
		if (store.scrollHandler === handleScroll) store.scrollHandler = null;
	});

	useOpenChangeComplete(() => ({
		enabled: store.open,
		open: store.open,
		element: store.popupElement,
		onComplete() {
			if (store.open) store.notifyOpenChangeComplete(true);
		}
	}));

	$effect(() => {
		if (store.open || positioner.alignItemWithTriggerActive) return;
		initialPlaced = false;
		reachedMaxHeight = false;
		untrack(() => store.clearAlignedStyles());
	});

	$effect(() => {
		const open = store.open;
		const trigger = store.triggerElement;
		const positionerElement = store.positionerElement;
		const popupElement = store.popupElement;
		const aligned = positioner.alignItemWithTriggerActive;
		const isPositioned = positioner.positioning.isPositioned;
		const listElement = store.listElement;
		const highlightItemOnHover = store.root.highlightItemOnHover;
		const rtl = direction.direction === 'rtl';

		// Floating UI's first pass still sets CSS variables such as `--anchor-width` that the
		// aligned layout reads.
		if (
			!open ||
			!trigger ||
			!positionerElement ||
			!popupElement ||
			(aligned && !isPositioned) ||
			untrack(() => store.transitionStatus) === 'ending'
		) {
			return;
		}

		untrack(() => {
			initialPlaced = true;
			store.writeAlignedStyles('popup', { [TRANSFORM_ORIGIN_VAR]: '' });

			if (!aligned) {
				// The list owns scrolling once it mounts. This effect then runs again.
				scrollArrowFrame.request(() =>
					store.handleScrollArrowVisibility(listElement || popupElement)
				);
				return;
			}

			layOutAligned(trigger, positionerElement, popupElement, listElement, {
				rtl,
				highlightItemOnHover
			});
		});
	});

	function layOutAligned(
		triggerElement: HTMLElement,
		positionerElement: HTMLElement,
		popupElement: HTMLElement,
		listElement: HTMLElement | null,
		options: { rtl: boolean; highlightItemOnHover: boolean }
	) {
		// Transforms on the popup would skew the measurements.
		const restoreTransformStyles = unsetTransformStyles(popupElement);
		try {
			let textElement = store.textAt(store.selectedIndex);
			if (!textElement?.isConnected) {
				const first = store.textAt(0);
				textElement = !store.hasSelectedValue && first?.isConnected ? first : null;
			}
			const valueElement = store.valueElement;

			const win = ownerWindow(positionerElement);
			const positionerStyles = win.getComputedStyle(positionerElement);
			const popupStyles = win.getComputedStyle(popupElement);

			const doc = ownerDocument(triggerElement);
			const scale = getScale(triggerElement);
			const triggerRect = normalizeRect(triggerElement.getBoundingClientRect(), scale);
			const positionerRect = normalizeRect(positionerElement.getBoundingClientRect(), scale);
			const triggerHeight = triggerRect.height;
			const scroller = listElement || popupElement;
			const scrollHeight = scroller.scrollHeight;

			const borderBottom = parseFloat(popupStyles.borderBottomWidth);
			// An unset or `0` margin or min-height takes the default.
			const marginTop = parseFloat(positionerStyles.marginTop) || 10;
			const marginBottom = parseFloat(positionerStyles.marginBottom) || 10;
			const minHeight = parseFloat(positionerStyles.minHeight) || 100;
			const maxPopupHeight = getMaxPopupHeight(popupStyles);

			const paddingLeft = 5;
			const paddingRight = 5;
			const triggerCollisionThreshold = 20;

			const viewportHeight = doc.documentElement.clientHeight - marginTop - marginBottom;
			const viewportWidth = doc.documentElement.clientWidth;
			const availableSpaceBeneathTrigger = viewportHeight - triggerRect.bottom + triggerHeight;

			let textRect: ReturnType<typeof normalizeRect> | undefined;
			let alignedLeft = options.rtl ? triggerRect.right - positionerRect.width : triggerRect.left;
			let offsetY = 0;

			if (textElement && valueElement) {
				const valueRect = normalizeRect(valueElement.getBoundingClientRect(), scale);
				textRect = normalizeRect(textElement.getBoundingClientRect(), scale);
				alignedLeft =
					positionerRect.left +
					(options.rtl ? valueRect.right - textRect.right : valueRect.left - textRect.left);
				const valueCenterFromTriggerTop = valueRect.top - triggerRect.top + valueRect.height / 2;
				const textCenterFromPositionerTop = textRect.top - positionerRect.top + textRect.height / 2;
				offsetY = textCenterFromPositionerTop - valueCenterFromTriggerTop;
			}

			const idealHeight = availableSpaceBeneathTrigger + offsetY + marginBottom + borderBottom;
			let height = Math.min(viewportHeight, idealHeight);
			const maxHeight = viewportHeight - marginTop - marginBottom;
			const scrollTop = idealHeight - height;
			const maxRight = viewportWidth - paddingRight;

			store.writeAlignedStyles('positioner', {
				left: `${clamp(alignedLeft, paddingLeft, maxRight - positionerRect.width)}px`,
				height: `${height}px`,
				// `none` so the explicit height wins over a `max-height` from user CSS.
				'max-height': 'none',
				'margin-top': `${marginTop}px`,
				'margin-bottom': `${marginBottom}px`
			});
			store.writeAlignedStyles('popup', { height: '100%' });

			const maxScrollTop = getMaxScrollTop(scroller);
			const isTopPositioned = scrollTop >= maxScrollTop - SCROLL_EDGE_TOLERANCE_PX;
			if (isTopPositioned) {
				height = Math.min(viewportHeight, positionerRect.height) - (scrollTop - maxScrollTop);
			}

			// Near the viewport edges, or below the min height, overlapping the trigger reads poorly.
			const fallbackToAlignPopupToTrigger =
				triggerRect.top < triggerCollisionThreshold ||
				triggerRect.bottom > viewportHeight - triggerCollisionThreshold ||
				Math.ceil(height) + SCROLL_EDGE_TOLERANCE_PX < Math.min(scrollHeight, minHeight);
			// Safari misplaces the popup when pinch-zoomed.
			const isPinchZoomed = (win.visualViewport?.scale ?? 1) !== 1 && platform.engine.webkit;

			if (fallbackToAlignPopupToTrigger || isPinchZoomed) {
				store.clearAlignedStyles();
				positioner.disableAlignItemWithTrigger();
				return;
			}

			const initialHeight = Math.max(minHeight, height);

			if (isTopPositioned) {
				const topOffset = Math.max(0, viewportHeight - idealHeight);
				store.writeAlignedStyles('positioner', {
					top: positionerRect.height >= maxHeight ? '0' : `${topOffset}px`,
					height: `${height}px`
				});
				scroller.scrollTop = getMaxScrollTop(scroller);
			} else {
				store.writeAlignedStyles('positioner', { bottom: '0' });
				scroller.scrollTop = scrollTop;
			}

			if (textRect) {
				const popupTop = positionerRect.top;
				const popupHeight = positionerRect.height;
				const textCenterY = textRect.top + textRect.height / 2;
				const clampedY = clamp(
					popupHeight > 0 ? ((textCenterY - popupTop) / popupHeight) * 100 : 50,
					0,
					100
				);
				store.writeAlignedStyles('popup', { [TRANSFORM_ORIGIN_VAR]: `50% ${clampedY}%` });
			}

			if (initialHeight === viewportHeight || height >= maxPopupHeight) {
				reachedMaxHeight = true;
			}

			store.handleScrollArrowVisibility(scroller);

			if (
				options.highlightItemOnHover &&
				store.selectedIndex === null &&
				store.activeIndex === null &&
				store.items.elements.length > 0
			) {
				store.activeIndex = 0;
			}
		} finally {
			restoreTransformStyles();
		}
	}

	$effect(() => {
		const positionerElement = store.positionerElement;
		if (!positioner.alignItemWithTriggerActive || !positionerElement || !store.open) return;
		return on(ownerWindow(positionerElement), 'resize', (event) => {
			store.setOpen(false, createChangeEventDetails(REASONS.windowResize, event));
		});
	});

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
		};
	}

	function insideToolbar() {
		const trigger = store.triggerElement;
		return trigger instanceof Element && Boolean(trigger.closest('[role="toolbar"]'));
	}

	/**
	 * The popup is the focus target. The shared manager counts its own focus guards as
	 * tabbables, so its default would focus a guard and close on focus-out.
	 */
	function focusIn() {
		return store.popupElement ?? true;
	}

	// Close interaction comes from the shared manager. `null` falls back to the trigger there.
	function focusReturn(closeType: string | null): boolean | HTMLElement | null | void {
		const spec = finalFocus;
		if (typeof spec !== 'function') return spec;
		return spec(closeType ?? '');
	}

	const partState: SelectPopupState = $derived({
		open: store.open,
		transitionStatus: store.transitionStatus,
		side: positioner.side,
		align: positioner.align
	});

	const aligned = $derived(positioner.alignItemWithTriggerActive);
	const hasList = $derived(store.listElement != null);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		withTypeahead(
			mergeProps(
				store.popupProps,
				{
					...(hasList
						? { role: 'presentation' as const }
						: {
								role: 'listbox' as const,
								'aria-multiselectable': store.multiple || undefined,
								'aria-readonly': store.root.readOnly || undefined,
								id: `${store.root.id}-list`
							}),
					onkeydown(event: KeyboardEvent) {
						if (insideToolbar() && COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
					},
					onscroll(event: Event) {
						if (hasList) return;
						handleScroll(event.currentTarget as HTMLElement);
					},
					class: !hasList && aligned ? DISABLE_SCROLLBAR_CLASS : undefined,
					style: toCssStyle({
						...(aligned ? (hasList ? { height: '100%' } : LIST_FUNCTIONAL_STYLES) : {}),
						...store.alignedPopupStyle,
						...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
					}),
					...getStateAttributesProps(partState, popupTransitionStateMapping),
					[bindKey]: bindPopup
				},
				elementProps
			)
		)
	);

	type Handler = (event: Event) => void;

	/**
	 * Typeahead runs after the other handlers, even for a keydown an item prevented: a Space
	 * typed inside a match is prevented so it does not select the item. mergeProps would skip it.
	 */
	function withTypeahead<T extends object>(merged: T): T {
		const next: Record<string, unknown> = { ...(merged as Record<string, unknown>) };
		for (const [key, handler] of Object.entries(store.popupTypeahead)) {
			const before = next[key] as Handler | undefined;
			next[key] = (event: Event) => {
				before?.(event);
				(handler as Handler)(event);
			};
		}
		return next as T;
	}
</script>

{#if csp.disableStyleElements !== true}
	<svelte:element this={"style"} nonce={csp.nonce}>{DISABLE_SCROLLBAR_CSS}</svelte:element>
{/if}
<FloatingFocusManager
	{store}
	modal={false}
	disabled={!store.mounted}
	initialFocus={focusIn}
	returnFocus={typeof finalFocus === 'function' ? focusReturn : (finalFocus ?? true)}
	restoreFocus
>
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
</FloatingFocusManager>
