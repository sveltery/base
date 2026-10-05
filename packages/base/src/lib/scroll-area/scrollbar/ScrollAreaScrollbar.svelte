<script lang="ts">
  // Base UI1.8.0 ScrollAreaScrollbar.tsx source wheel/track bodies; MIT.
  import RenderElement from '../../internals/RenderElement.svelte';
  import { addEventListener } from '../../utils/addEventListener.js';
  import { contains, getTarget } from '../../utils/shadowDom.js';
  import { useDirection } from '../../direction-provider/context.js';
  import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext.js';
  import { setScrollAreaScrollbarContext } from './ScrollAreaScrollbarContext.js';
  import { scrollAreaStateAttributesMapping } from '../root/stateAttributes.js';
  import { getOffset } from '../utils/getOffset.js';
  import * as ScrollAreaRootCssVars from '../root/ScrollAreaRootCssVars.js';
  import * as ScrollAreaScrollbarCssVars from './ScrollAreaScrollbarCssVars.js';
  import type { ScrollAreaScrollbarProps, ScrollAreaScrollbarState } from '../types.js';
  let {
    render,
    class: classProp,
    orientation = 'vertical',
    keepMounted = false,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ScrollAreaScrollbarProps = $props();
  const root = useScrollAreaRootContext();
  const {
    scrollbarYRef,
    scrollbarXRef,
    viewportRef,
    thumbYRef,
    thumbXRef,
    handlePointerDown,
    handlePointerUp,
    handleScroll,
    disableViewportSnap,
    rootId,
  } = root;
  const vertical = $derived(orientation === 'vertical');
  const state: ScrollAreaScrollbarState = $derived({
    ...root.viewportState,
    hovering: root.hovering,
    scrolling: vertical ? root.scrollingY : root.scrollingX,
    orientation,
  });
  const getDirection = useDirection();
  const hideTrackUntilMeasured = $derived(!root.hasMeasuredScrollbar && !keepMounted);
  const isHidden = $derived(vertical ? root.hiddenState.y : root.hiddenState.x);
  const shouldRender = $derived(keepMounted || !isHidden);
  setScrollAreaScrollbarContext(() => orientation);
  $effect(() => {
    const direction = getDirection();
    if (!shouldRender) {
      return undefined;
    }

    const viewportEl = viewportRef.current;
    const scrollbarEl = vertical ? scrollbarYRef.current : scrollbarXRef.current;

    if (!scrollbarEl) {
      return undefined;
    }

    function handleWheel(event: WheelEvent) {
      if (!viewportEl || event.ctrlKey) {
        return;
      }

      const horizontal = !vertical;
      const scrollProperty = horizontal ? 'scrollLeft' : 'scrollTop';
      const delta = horizontal ? event.deltaX : event.deltaY;
      if (delta === 0) {
        return;
      }

      const maxScroll = horizontal
        ? viewportEl.scrollWidth - viewportEl.clientWidth
        : viewportEl.scrollHeight - viewportEl.clientHeight;
      // RTL horizontal scrolling uses a negative `scrollLeft` range, from 0 to `-maxScroll`.
      const minScroll = horizontal && direction === 'rtl' ? -maxScroll : 0;
      const maxScrollValue = horizontal && direction === 'rtl' ? 0 : maxScroll;
      const scrollValue = viewportEl[scrollProperty];

      // At an edge (or with no overflow), let the wheel event chain to the
      // parent/page instead of swallowing it via `preventDefault`.
      if ((scrollValue <= minScroll && delta < 0) || (scrollValue >= maxScrollValue && delta > 0)) {
        return;
      }

      event.preventDefault();

      viewportEl[scrollProperty] = Math.min(
        maxScrollValue,
        Math.max(minScroll, scrollValue + delta),
      );

      handleScroll({ x: viewportEl.scrollLeft, y: viewportEl.scrollTop });
    }

    return addEventListener(scrollbarEl, 'wheel', handleWheel, {
      passive: false,
    });
  });

  const internalProps = $derived({
    ...(rootId && { 'data-id': `${rootId}-scrollbar` }),
    'aria-hidden': true,
    onpointerdown(event: PointerEvent) {
      if (event.button !== 0) {
        return;
      }

      const target = getTarget(event) as Element | null;
      const thumbEl = vertical ? thumbYRef.current : thumbXRef.current;

      // Ignore clicks on thumb, including cases where React retargets the
      // synthetic event to the track host across a shadow boundary.
      if (thumbEl && contains(thumbEl, target)) {
        return;
      }

      const viewportEl = viewportRef.current;
      if (!viewportEl) {
        return;
      }

      const scrollbarEl = vertical ? scrollbarYRef.current : scrollbarXRef.current;

      if (!thumbEl || !scrollbarEl) {
        return;
      }

      const axis = vertical ? 'y' : 'x';
      const thumbOffset = getOffset(thumbEl, 'margin', axis);
      const scrollbarOffset = getOffset(scrollbarEl, 'padding', axis);
      const thumbSizePx = vertical ? thumbEl.offsetHeight : thumbEl.offsetWidth;
      const trackRect = scrollbarEl.getBoundingClientRect();
      const clickPosition = vertical
        ? event.clientY - trackRect.top - thumbSizePx / 2 - scrollbarOffset + thumbOffset / 2
        : event.clientX - trackRect.left - thumbSizePx / 2 - scrollbarOffset + thumbOffset / 2;

      const scrollableSize = vertical ? viewportEl.scrollHeight : viewportEl.scrollWidth;
      const viewportSize = vertical ? viewportEl.clientHeight : viewportEl.clientWidth;
      const trackSize = vertical ? scrollbarEl.offsetHeight : scrollbarEl.offsetWidth;

      const maxThumbOffset = trackSize - thumbSizePx - scrollbarOffset - thumbOffset;
      // A short or heavily padded track can drive `maxThumbOffset` to zero or
      // negative once the thumb hits its `MIN_THUMB_SIZE` floor. Dividing by it
      // would yield a non-finite (`Infinity`/`NaN`) or inverted scroll position.
      if (maxThumbOffset <= 0) {
        return;
      }

      const scrollRatio = clickPosition / maxThumbOffset;
      const maxScrollDistance = scrollableSize - viewportSize;

      // Disable snapping before the jump-to-click assignment, or the
      // assigned position quantizes to the nearest snap point and the thumb
      // stays offset from the pointer for the whole drag. `handlePointerDown`
      // below re-runs this as a guarded no-op for the thumb-drag path.
      disableViewportSnap();

      if (vertical) {
        viewportEl.scrollTop = scrollRatio * maxScrollDistance;
      } else if (getDirection() === 'rtl') {
        viewportEl.scrollLeft = -(1 - scrollRatio) * maxScrollDistance;
      } else {
        viewportEl.scrollLeft = scrollRatio * maxScrollDistance;
      }

      handleScroll({ x: viewportEl.scrollLeft, y: viewportEl.scrollTop });

      handlePointerDown(event);
    },
    // Native scrollbars don't move focus when pressed, whichever button is used.
    // Handled here rather than on the thumb so the bubbled press covers both.
    onmousedown(event: MouseEvent) {
      event.preventDefault();
    },
    onpointerup: handlePointerUp,
    // Mirror `onpointerup` so a browser-cancelled gesture on the track (no thumb
    // child captures the pointer) still clears the drag state.
    onpointercancel: handlePointerUp,
    style: {
      position: 'absolute',
      touchAction: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      visibility: hideTrackUntilMeasured ? 'hidden' : undefined,
      ...(vertical
        ? {
            top: 0,
            bottom: `var(${ScrollAreaRootCssVars.scrollAreaCornerHeight})`,
            insetInlineEnd: 0,
            [ScrollAreaScrollbarCssVars.scrollAreaThumbHeight as string]: `${root.thumbSize.height}px`,
          }
        : {
            insetInlineStart: 0,
            insetInlineEnd: `var(${ScrollAreaRootCssVars.scrollAreaCornerWidth})`,
            bottom: 0,
            [ScrollAreaScrollbarCssVars.scrollAreaThumbWidth as string]: `${root.thumbSize.width}px`,
          }),
    },
  });

  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    ref: [forwardedRef, vertical ? scrollbarYRef : scrollbarXRef],
    state,
    props: [internalProps, elementProps],
    stateAttributesMapping: scrollAreaStateAttributesMapping,
  });
</script>

{#if shouldRender}<RenderElement tag="div" {componentProps} {params} {children} />{/if}
