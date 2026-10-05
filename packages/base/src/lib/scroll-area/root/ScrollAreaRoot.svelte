<script lang="ts">
  // Base UI1.8.0 ScrollAreaRoot.tsx source business bodies; MIT.
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useTimeout } from '@sveltery/utils/useTimeout';
  import { useBaseUiId } from '../../internals/useBaseUiId.js';
  import { contains } from '@sveltery/utils/shadowDom';
  import { getCSPContext } from '../../csp-provider/context.js';
  import { styleDisableScrollbar } from '../../utils/styles.js';
  import { setScrollAreaRootContext } from './ScrollAreaRootContext.js';
  import { scrollAreaStateAttributesMapping } from './stateAttributes.js';
  import { getOffset } from '../utils/getOffset.js';
  import { SCROLL_TIMEOUT } from '../constants.js';
  import * as ScrollAreaRootCssVars from './ScrollAreaRootCssVars.js';
  import * as ScrollAreaScrollbarDataAttributes from '../scrollbar/ScrollAreaScrollbarDataAttributes.js';
  import type {
    ScrollAreaRootProps,
    ScrollAreaRootState,
    HiddenState,
    OverflowEdges,
    Size,
    Coords,
  } from '../types.js';
  let {
    render,
    class: classProp,
    overflowEdgeThreshold: overflowEdgeThresholdProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ScrollAreaRootProps = $props();
  const nativeId = $props.id();
  const rootId = useBaseUiId(undefined, nativeId);
  const overflowEdgeThreshold = $derived(
    normalizeOverflowEdgeThreshold(overflowEdgeThresholdProp),
  );
  const scrollYTimeout = useTimeout();
  const scrollXTimeout = useTimeout();
  const csp = getCSPContext();
  let hovering = $state(false);
  let scrollingX = $state(false);
  let scrollingY = $state(false);
  let touchModality = $state(false);
  let hasMeasuredScrollbar = $state(false);
  let cornerSize = $state<Size>({ width: 0, height: 0 });
  let thumbSize = $state<Size>({ width: 0, height: 0 });
  let overflowEdges = $state<OverflowEdges>({
    xStart: false,
    xEnd: false,
    yStart: false,
    yEnd: false,
  });
  let hiddenState = $state<HiddenState>({ x: true, y: true, corner: true });
  const rootRef = $state<{ current: HTMLElement | null }>({ current: null });
  const viewportRef = $state<{ current: HTMLElement | null }>({ current: null });
  const scrollbarYRef = $state<{ current: HTMLElement | null }>({
    current: null,
  });
  const scrollbarXRef = $state<{ current: HTMLElement | null }>({
    current: null,
  });
  const thumbYRef = $state<{ current: HTMLElement | null }>({ current: null });
  const thumbXRef = $state<{ current: HTMLElement | null }>({ current: null });
  const cornerRef = $state<{ current: HTMLElement | null }>({ current: null });
  const activePointerIdRef = { current: null as number | null };
  const startYRef = { current: 0 };
  const startXRef = { current: 0 };
  const startScrollTopRef = { current: 0 };
  const startScrollLeftRef = { current: 0 };
  const currentOrientationRef = {
    current: 'vertical' as 'vertical' | 'horizontal',
  };
  const scrollPositionRef = { current: { x: 0, y: 0 } };
  const savedSnapTypeRef = { current: null as string | null };
  const setScrollingY = (value: boolean) => {
    scrollingY = value;
  };
  const setScrollingX = (value: boolean) => {
    scrollingX = value;
  };
  const setTouchModality = (value: boolean) => {
    touchModality = value;
  };
  const setHovering = (value: boolean | ((previous: boolean) => boolean)) => {
    hovering = typeof value === 'function' ? value(hovering) : value;
  };
  function startScrolling(vertical: boolean) {
    const setScrolling = vertical ? setScrollingY : setScrollingX;
    const timeout = vertical ? scrollYTimeout : scrollXTimeout;

    setScrolling(true);
    timeout.start(SCROLL_TIMEOUT, () => {
      setScrolling(false);
    });
  }

  function handleScroll(scrollPosition: Coords) {
    const offsetX = scrollPosition.x - scrollPositionRef.current.x;
    const offsetY = scrollPosition.y - scrollPositionRef.current.y;

    scrollPositionRef.current = scrollPosition;

    if (offsetY !== 0) {
      startScrolling(true);
    }

    if (offsetX !== 0) {
      startScrolling(false);
    }
  }

  // CSS scroll snap forces every programmatic scroll to land on a snap
  // point, making thumb dragging jump between snap points. Native
  // scrollbars suppress snapping while dragging, so disable it until the
  // pointer is released; restoring the value re-snaps the viewport. The
  // save is guarded so a second pointer during an active drag can't
  // clobber the saved value with `none`.
  function disableViewportSnap() {
    const viewportEl = viewportRef.current;
    if (viewportEl && savedSnapTypeRef.current === null) {
      savedSnapTypeRef.current = viewportEl.style.scrollSnapType;
      viewportEl.style.scrollSnapType = 'none';
    }
  }

  function handlePointerDown(event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }

    if (activePointerIdRef.current !== null) {
      const activeThumb =
        currentOrientationRef.current === 'vertical'
          ? thumbYRef.current
          : thumbXRef.current;
      // A live drag holds capture for the active pointer — ignore other pointers.
      // No capture means the release went missing entirely (silent capture drop
      // with an id that never reappears, e.g. a lost touch contact), so let the
      // new pointer take over the latch instead of leaving dragging dead.
      if (activeThumb?.hasPointerCapture(activePointerIdRef.current)) {
        return;
      }
    }

    activePointerIdRef.current = event.pointerId;
    startYRef.current = event.clientY;
    startXRef.current = event.clientX;
    currentOrientationRef.current = (event.currentTarget as Element).getAttribute(
      ScrollAreaScrollbarDataAttributes.orientation,
    ) as 'vertical' | 'horizontal';

    const viewportEl = viewportRef.current;
    if (viewportEl) {
      startScrollTopRef.current = viewportEl.scrollTop;
      startScrollLeftRef.current = viewportEl.scrollLeft;
      disableViewportSnap();
    }

    const thumb =
      currentOrientationRef.current === 'vertical'
        ? thumbYRef.current
        : thumbXRef.current;
    thumb?.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent) {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    activePointerIdRef.current = null;
    // Clear the drag's scrolling state immediately rather than waiting for the
    // `SCROLL_TIMEOUT` timer armed by the last drag move, so every release path
    // (real, `pointercancel`, or the missed-release fallback) behaves the same.
    (currentOrientationRef.current === 'vertical'
      ? setScrollingY
      : setScrollingX)(false);

    if (savedSnapTypeRef.current !== null) {
      if (viewportRef.current) {
        viewportRef.current.style.scrollSnapType = savedSnapTypeRef.current;
      }
      savedSnapTypeRef.current = null;
    }

    const thumb =
      currentOrientationRef.current === 'vertical'
        ? thumbYRef.current
        : thumbXRef.current;
    // `pointercancel` releases capture implicitly, so guard against releasing a
    // capture we no longer hold (which would throw).
    if (thumb?.hasPointerCapture(event.pointerId)) {
      thumb.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    // The release can go missing entirely (e.g. the browser drops pointer
    // capture while the scrollbar is hidden mid-drag), leaving the drag
    // latched so a buttonless hover over the thumb scrolls the viewport.
    // Treat a move without the primary button held (`buttons` bit 1 unset)
    // as the missed release.
    if (event.buttons % 2 === 0) {
      handlePointerUp(event);
      return;
    }

    const viewportEl = viewportRef.current;
    if (!viewportEl) {
      return;
    }

    const vertical = currentOrientationRef.current === 'vertical';
    const thumbEl = vertical ? thumbYRef.current : thumbXRef.current;
    const scrollbarEl = vertical ? scrollbarYRef.current : scrollbarXRef.current;
    if (!thumbEl || !scrollbarEl) {
      return;
    }

    const axis = vertical ? 'y' : 'x';
    const scrollbarOffset = getOffset(scrollbarEl, 'padding', axis);
    const thumbOffset = getOffset(thumbEl, 'margin', axis);
    const thumbSizePx = vertical ? thumbEl.offsetHeight : thumbEl.offsetWidth;
    const trackSize = vertical
      ? scrollbarEl.offsetHeight
      : scrollbarEl.offsetWidth;
    const maxThumbOffset =
      trackSize - thumbSizePx - scrollbarOffset - thumbOffset;
    // A short or heavily padded track can drive `maxThumbOffset` to zero or
    // negative once the thumb hits its `MIN_THUMB_SIZE` floor. Dividing by it
    // would yield a non-finite (`Infinity`/`NaN`) or inverted scroll position.
    const delta = vertical
      ? event.clientY - startYRef.current
      : event.clientX - startXRef.current;
    const scrollRatio = maxThumbOffset <= 0 ? 0 : delta / maxThumbOffset;

    const scrollableSize = vertical
      ? viewportEl.scrollHeight
      : viewportEl.scrollWidth;
    const viewportSize = vertical
      ? viewportEl.clientHeight
      : viewportEl.clientWidth;
    const startScroll = vertical
      ? startScrollTopRef.current
      : startScrollLeftRef.current;
    const nextScroll =
      startScroll + scrollRatio * (scrollableSize - viewportSize);

    if (vertical) {
      viewportEl.scrollTop = nextScroll;
    } else {
      viewportEl.scrollLeft = nextScroll;
    }
    event.preventDefault();

    startScrolling(vertical);
  }

  function handleTouchModalityChange(event: PointerEvent) {
    setTouchModality(event.pointerType === 'touch');
  }

  function handlePointerEnterOrMove(event: PointerEvent) {
    handleTouchModalityChange(event);

    if (event.pointerType !== 'touch') {
      const isTargetRootChild = contains(
        rootRef.current,
        event.target as Element,
      );
      setHovering(isTargetRootChild);
    }
  }

  const rootState: ScrollAreaRootState = $derived({
    scrolling: scrollingX || scrollingY,
    hasOverflowX: !hiddenState.x,
    hasOverflowY: !hiddenState.y,
    overflowXStart: overflowEdges.xStart,
    overflowXEnd: overflowEdges.xEnd,
    overflowYStart: overflowEdges.yStart,
    overflowYEnd: overflowEdges.yEnd,
    cornerHidden: hiddenState.corner,
  });
  setScrollAreaRootContext({
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleScroll,
    disableViewportSnap,
    get cornerSize() {
      return cornerSize;
    },
    setCornerSize(value) {
      cornerSize = typeof value === 'function' ? value(cornerSize) : value;
    },
    get thumbSize() {
      return thumbSize;
    },
    setThumbSize(value) {
      thumbSize = typeof value === 'function' ? value(thumbSize) : value;
    },
    get hasMeasuredScrollbar() {
      return hasMeasuredScrollbar;
    },
    setHasMeasuredScrollbar(value) {
      hasMeasuredScrollbar =
        typeof value === 'function' ? value(hasMeasuredScrollbar) : value;
    },
    get touchModality() {
      return touchModality;
    },
    get scrollingX() {
      return scrollingX;
    },
    get scrollingY() {
      return scrollingY;
    },
    get hovering() {
      return hovering;
    },
    setHovering,
    viewportRef,
    scrollbarYRef,
    scrollbarXRef,
    thumbYRef,
    thumbXRef,
    cornerRef,
    rootId,
    get hiddenState() {
      return hiddenState;
    },
    setHiddenState(value) {
      hiddenState = typeof value === 'function' ? value(hiddenState) : value;
    },
    get overflowEdges() {
      return overflowEdges;
    },
    setOverflowEdges(value) {
      overflowEdges = typeof value === 'function' ? value(overflowEdges) : value;
    },
    get viewportState() {
      return rootState;
    },
    get overflowEdgeThreshold() {
      return overflowEdgeThreshold;
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
  const internalProps = $derived({
    role: 'presentation',
    onpointerenter: handlePointerEnterOrMove,
    onpointermove: handlePointerEnterOrMove,
    onpointerdown: handleTouchModalityChange,
    onpointerleave() {
      setHovering(false);
    },
    style: {
      position: 'relative',
      [ScrollAreaRootCssVars.scrollAreaCornerHeight]: `${cornerSize.height}px`,
      [ScrollAreaRootCssVars.scrollAreaCornerWidth]: `${cornerSize.width}px`,
    },
  });
  const params = $derived({
    state: rootState,
    ref: [forwardedRef, rootRef],
    props: [internalProps, elementProps],
    stateAttributesMapping: scrollAreaStateAttributesMapping,
  });
  function normalizeOverflowEdgeThreshold(
    threshold: ScrollAreaRootProps['overflowEdgeThreshold'] | undefined,
  ) {
    const thresholds =
      typeof threshold === 'number'
        ? {
            xStart: threshold,
            xEnd: threshold,
            yStart: threshold,
            yEnd: threshold,
          }
        : threshold;

    return {
      xStart: Math.max(0, thresholds?.xStart || 0),
      xEnd: Math.max(0, thresholds?.xEnd || 0),
      yStart: Math.max(0, thresholds?.yStart || 0),
      yEnd: Math.max(0, thresholds?.yEnd || 0),
    };
  }
</script>
{#if !csp.disableStyleElements}<styleDisableScrollbar.getElement nonce={csp.nonce} />{/if}
<RenderElement tag="div" {componentProps} {params} {children} />
