// Ported business body from Base UI v1.8.0 useCollapsiblePanel.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { onDestroy, untrack } from 'svelte';
import { DEV } from 'esm-env';
import { addEventListener } from '../../utils/addEventListener.js';
import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
import { AnimationFrame } from '../../utils/useAnimationFrame.js';
import { useStableCallback } from '../../utils/useStableCallback.js';
import { warn } from '../../utils/warn.js';
import { ownerWindow } from '../../utils/owner.js';
import type { HTMLProps } from '../../internals/types.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete.svelte.js';
import { useAnimationsFinished } from '../../internals/useAnimationsFinished.js';
import * as CollapsiblePanelDataAttributes from './CollapsiblePanelDataAttributes.js';
import type { CollapsibleRootChangeEventDetails } from '../types.js';
import type { TransitionStatus } from '../../internals/useTransitionStatus.svelte.js';

type AnimationType = 'css-transition' | 'css-animation' | 'none';

interface Dimensions {
  height: number | undefined;
  width: number | undefined;
}

const EMPTY_DIMENSIONS: Dimensions = {
  height: undefined,
  width: undefined,
};

export function useCollapsiblePanel(
  parameters: UseCollapsiblePanelParameters,
): UseCollapsiblePanelReturnValue {
  // Native bind:ref belongs to RenderElement; its canonical merged-ref owner
  // fans out this internal ref and the actual rendered-host binding.
  const panelRef = { current: null as HTMLElement | null };
  const animationTypeRef = { current: null as AnimationType | null };
  let dimensions = $state.raw<Dimensions>(EMPTY_DIMENSIONS);
  const setDimensionsUnwrapped = (next: Dimensions) => { dimensions = next; };
  const lastMeasuredDimensionsRef = { current: EMPTY_DIMENSIONS };
  // `beforematch` should reveal the matched content immediately, so the next
  // open cycle skips author-defined motion once and then returns to normal.
  const shouldSkipNextOpenRef = { current: false };
  // Keyframe mount animations on initially open panels cause a visible layout
  // shift during the server-rendered first paint, so suppress that first open
  // lifecycle until the panel has been closed once.
  const shouldPreventMountAnimationRef = { current: untrack(() => parameters.open) };
  // Some open paths intentionally bypass motion, but the shared root transition
  // status still advances asynchronously. Override the panel to idle so its data
  // attributes and dimension cleanup reflect the immediate open state.
  let forcePanelIdle = $state(false);
  const setForcePanelIdle = (next: boolean) => { forcePanelIdle = next; };
  const pendingTemporaryStyleRestoreRef = { current: null as (() => void) | null };

  // Only used to handle panel close
  const runOnceCloseAnimationsFinish = useAnimationsFinished(panelRef);

  const hidden = $derived(!parameters.open && !parameters.mounted);
  const panelTransitionStatus = $derived(forcePanelIdle ? 'idle' : parameters.transitionStatus);
  const shouldPreventOpenAnimation = $derived(parameters.open && shouldPreventMountAnimationRef.current);
  const renderedDimensions = $derived(
    !parameters.open && parameters.mounted && animationTypeRef.current === 'css-animation' &&
    dimensions.height === undefined && dimensions.width === undefined
      ? lastMeasuredDimensionsRef.current : dimensions,
  );
  const shouldPersistHiddenTransitionStyles = $derived(
    parameters.hiddenUntilFound && hidden && animationTypeRef.current !== 'css-animation',
  );

  // Most measured dimensions are reused later when CSS keyframe closes need a
  // pixel size after the rendered dimensions have been reset back to `auto`.
  // Passing `false` is only for clearing the current dimensions state.
  const setDimensions = useStableCallback(
    (nextDimensions: Dimensions, shouldCacheMeasurement: boolean = true) => {
      if (shouldCacheMeasurement) {
        lastMeasuredDimensionsRef.current = nextDimensions;
      }

      setDimensionsUnwrapped(nextDimensions);
    },
  );

  const restorePendingTemporaryStyle = useStableCallback(() => {
    pendingTemporaryStyleRestoreRef.current?.();
    pendingTemporaryStyleRestoreRef.current = null;
  });

  const setPendingTemporaryStyleRestore = useStableCallback((restore: () => void) => {
    restorePendingTemporaryStyle();
    pendingTemporaryStyleRestoreRef.current = () => {
      pendingTemporaryStyleRestoreRef.current = null;
      restore();
    };
  });

  useIsoLayoutEffect(() => {
    // `forcePanelIdle` is only a temporary override for open paths that skip
    // motion. Keep it active while the shared root still reports `starting`,
    // then drop it once the root transition state catches up.
    if (!forcePanelIdle || parameters.transitionStatus === 'starting') {
      return;
    }

    setForcePanelIdle(false);
  }, () => [forcePanelIdle, parameters.transitionStatus]);

  onDestroy(restorePendingTemporaryStyle);

  useIsoLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }

    // `beforematch` can temporarily force a `0s` motion duration so the matched
    // content reveals immediately. Restore the authored duration before detecting
    // the next close animation type, otherwise that first close is misread as
    // "no motion" and the close transition or keyframe gets skipped.
    if (!parameters.open && pendingTemporaryStyleRestoreRef.current) {
      restorePendingTemporaryStyle();
    }

    const animationType = getAnimationType(panel, shouldPreventOpenAnimation);
    animationTypeRef.current = animationType;

    // Initially open keyframe panels skip their first paint animation to avoid
    // layout shift, but we still need to cache the expanded size so the first
    // close animation can start from pixels instead of `auto`.
    if (
      parameters.open &&
      parameters.transitionStatus === 'idle' &&
      shouldPreventMountAnimationRef.current &&
      animationType === 'css-animation'
    ) {
      lastMeasuredDimensionsRef.current = getDimensions(panel);
      return undefined;
    }

    // Handle the opening pass: measure the expanded size and, when necessary,
    // neutralize author-defined motion so the panel can open immediately.
    if (parameters.open && parameters.transitionStatus === 'starting') {
      // `beforematch` opens should reveal the panel immediately so find-in-page
      // does not wait for the author-defined transition or animation to finish.
      const skipNextOpen = shouldSkipNextOpenRef.current;
      shouldSkipNextOpenRef.current = false;

      if (animationType === 'none') {
        setDimensions(getDimensions(panel));
        setForcePanelIdle(true);
        return undefined;
      }

      if (animationType === 'css-transition') {
        const restoreLayoutStyles = resetLayoutStyles(panel);
        setDimensions(getDimensions(panel));

        if (!skipNextOpen) {
          return restoreLayoutStyles;
        }

        const restoreTransitionDuration = setTemporaryStyle(panel, 'transition-duration', '0s');
        setPendingTemporaryStyleRestore(restoreTransitionDuration);
        setForcePanelIdle(true);
        return restoreLayoutStyles;
      }

      setDimensions(getDimensions(panel));

      const restoreAnimationName = setTemporaryStyle(panel, 'animation-name', 'none');
      if (!skipNextOpen) {
        restoreAnimationName();
        return undefined;
      }

      const restoreAnimationDuration = setTemporaryStyle(panel, 'animation-duration', '0s');

      restoreAnimationName();
      setPendingTemporaryStyleRestore(restoreAnimationDuration);
      setForcePanelIdle(true);

      return undefined;
    }

    // Capture the current size as soon as close is requested, before the
    // deferred ending phase applies closed styles. This keeps close transitions
    // starting from a measured pixel value, including interrupted opens.
    if (!parameters.open && parameters.mounted && (parameters.transitionStatus === 'idle' || parameters.transitionStatus === 'starting')) {
      shouldPreventMountAnimationRef.current = false;

      if (animationType === 'none') {
        setDimensions(EMPTY_DIMENSIONS, false);
        parameters.setMounted(false);
        return undefined;
      }

      setDimensions(getDimensions(panel));
      return undefined;
    }

    if (parameters.transitionStatus !== 'ending') {
      return undefined;
    }

    // Reachable when `transitionStatus` already flipped to `ending` before this effect ran, so
    // the close branch above was skipped. Without motion there is nothing to wait for, so unmount
    // here instead of deferring to the animation-finished path below.
    if (animationType === 'none') {
      parameters.setMounted(false);
      return undefined;
    }

    const nextDimensions = getDimensions(panel);
    const hasMeasuredSize = nextDimensions.height > 0 || nextDimensions.width > 0;

    if (!hasMeasuredSize) {
      parameters.setMounted(false);
      return undefined;
    }

    setDimensions(nextDimensions);

    if (animationType === 'css-animation') {
      const restoreAnimationName = setTemporaryStyle(panel, 'animation-name', 'none');
      restoreAnimationName();
    }

    return undefined;
  }, () => [
    parameters.mounted,
    parameters.open,
    restorePendingTemporaryStyle,
    setDimensions,
    parameters.setMounted,
    setPendingTemporaryStyleRestore,
    shouldPreventOpenAnimation,
    parameters.transitionStatus,
  ]);

  useOpenChangeComplete({
    get enabled() { return parameters.open && parameters.mounted && panelTransitionStatus === 'idle'; },
    open: true,
    ref: panelRef,
    onComplete() {
      // Retain the Source current-open guard against a finished microtask
      // racing the next close commit and animation-observer cleanup.
      // Clearing the measured size in that window would make the close transition start from
      // `height: 0` instead of the expanded pixel height.
      if (!parameters.open) {
        return;
      }

      setDimensions(EMPTY_DIMENSIONS, false);
    },
  });

  // Closing panels need extra sequencing beyond `useOpenChangeComplete`.
  // This native post-DOM effect runs after the `ending` render has committed, so
  // `[data-ending-style]` is already present. Chrome can still register the
  // exit transition one frame later when an Accordion closes one item while
  // opening another, so wait one frame before watching animations.
  // See https://github.com/mui/base-ui/issues/3099
  useIsoLayoutEffect(() => {
    if (parameters.open || !parameters.mounted || panelTransitionStatus !== 'ending') {
      return undefined;
    }

    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }

    const abortController = new AbortController();
    let endingStyleFrame = -1;

    function handleComplete() {
      // Native getters provide the current open value. Retain the Source
      // guard so a stale close completion cannot unmount a reopened panel.
      if (parameters.open) {
        return;
      }

      parameters.setMounted(false);
      setDimensions(EMPTY_DIMENSIONS, false);
    }

    endingStyleFrame = AnimationFrame.request(() => {
      runOnceCloseAnimationsFinish(handleComplete, abortController.signal);
    });

    return () => {
      AnimationFrame.cancel(endingStyleFrame);
      abortController.abort();
    };
  }, () => [
    parameters.mounted,
    parameters.open,
    panelTransitionStatus,
    runOnceCloseAnimationsFinish,
    setDimensions,
    parameters.setMounted,
  ]);

  useIsoLayoutEffect(
    function registerBeforeMatchListener() {
      const panel = panelRef.current;
      if (!panel) {
        return undefined;
      }

      function handleBeforeMatch(event: Event) {
        const eventDetails = createChangeEventDetails('none', event);

        parameters.onOpenChange(true, eventDetails);

        if (eventDetails.isCanceled) {
          return;
        }

        shouldSkipNextOpenRef.current = true;
        parameters.setOpen(true);
      }

      return addEventListener(panel, 'beforematch', handleBeforeMatch);
    },
    () => [parameters.onOpenChange, parameters.setOpen],
  );

  const shouldRender = $derived(parameters.keepMounted || parameters.hiddenUntilFound || parameters.mounted || parameters.open);

  return {
    get height() { return renderedDimensions.height; },
    get props() { return {
      ...(shouldPersistHiddenTransitionStyles
        ? { [CollapsiblePanelDataAttributes.startingStyle]: '' }
        : undefined),
      hidden: hidden && parameters.hiddenUntilFound ? 'until-found' : hidden,
      id: parameters.id,
    }; },
    ref: panelRef,
    get shouldPreventOpenAnimation() { return shouldPreventOpenAnimation; },
    get shouldRender() { return shouldRender; },
    get transitionStatus() { return panelTransitionStatus; },
    get width() { return renderedDimensions.width; },
  };
}

function getDimensions(element: HTMLElement) {
  return {
    height: element.scrollHeight,
    width: element.scrollWidth,
  };
}

function getAnimationType(
  element: HTMLElement,
  hasSuppressedMountAnimation: boolean,
): AnimationType {
  const panelStyles = ownerWindow(element).getComputedStyle(element);
  const hasAnimation =
    (panelStyles.animationName
      .split(',')
      .map((name) => name.trim())
      .some((name) => name !== '' && name !== 'none') ||
      hasSuppressedMountAnimation) &&
    hasNonZeroDuration(panelStyles.animationDuration);
  const hasTransition = hasNonZeroDuration(panelStyles.transitionDuration);

  if (hasAnimation && hasTransition) {
    /* istanbul ignore else -- `process.env.NODE_ENV` is a build-time constant under test */
    if (DEV) {
      warn(
        'CSS transitions and CSS animations both detected on Collapsible or Accordion panel.',
        'Only one of either animation type should be used.',
      );
    }

    return 'css-transition';
  }

  if (hasTransition) {
    return 'css-transition';
  }

  if (hasAnimation) {
    return 'css-animation';
  }

  return 'none';
}

function hasNonZeroDuration(value: string) {
  return value
    .split(',')
    .map((part) => part.trim())
    .some((part) => part !== '' && Number.parseFloat(part) > 0);
}

/**
 * Temporarily overrides an inline style property and returns a cleanup that
 * restores the previous inline value and priority.
 * @param element - The element whose inline style should be updated.
 * @param property - The CSS property name to override.
 * @param value - The temporary value to assign.
 * @returns A cleanup function that restores the original inline style state.
 */
function setTemporaryStyle(element: HTMLElement, property: string, value: string): () => void {
  const previousValue = element.style.getPropertyValue(property);
  const previousPriority = element.style.getPropertyPriority(property);

  element.style.setProperty(property, value);

  return () => {
    if (previousValue === '') {
      element.style.removeProperty(property);
      return;
    }

    element.style.setProperty(property, previousValue, previousPriority);
  };
}

/**
 * Temporarily resets inline alignment styles that can distort scroll-based
 * size measurements, then restores them on the next animation frame.
 * @param element - The panel element being measured.
 * @returns A cleanup function that cancels the scheduled restore and reapplies
 * the original inline layout styles immediately.
 */
function resetLayoutStyles(element: HTMLElement): () => void {
  const originalLayoutStyles = {
    'justify-content': element.style.justifyContent,
    'align-items': element.style.alignItems,
    'align-content': element.style.alignContent,
    'justify-items': element.style.justifyItems,
  };

  Object.keys(originalLayoutStyles).forEach((key) => {
    element.style.setProperty(key, 'initial', 'important');
  });

  function restoreLayoutStyles() {
    Object.entries(originalLayoutStyles).forEach(([key, value]) => {
      if (value === '') {
        element.style.removeProperty(key);
        return;
      }

      element.style.setProperty(key, value);
    });
  }

  const frame = AnimationFrame.request(restoreLayoutStyles);

  return () => {
    AnimationFrame.cancel(frame);
    restoreLayoutStyles();
  };
}

export interface UseCollapsiblePanelParameters {
  /**
   * Allows the browser's built-in page search to find and expand the panel contents.
   *
   * Overrides the `keepMounted` prop and uses `hidden="until-found"`
   * to hide the element without removing it from the DOM.
   */
  hiddenUntilFound: boolean;
  /**
   * The `id` attribute of the panel.
   */
  id: string | undefined;
  /**
   * Whether to keep the element in the DOM while the panel is closed.
   * This prop is ignored when `hiddenUntilFound` is used.
   */
  keepMounted: boolean;
  /**
   * Whether the collapsible panel is mounted for transition and hidden-state
   * purposes. This can be `false` while the element remains in the DOM when
   * `keepMounted` or `hiddenUntilFound` is enabled.
   */
  mounted: boolean;
  onOpenChange: (open: boolean, eventDetails: CollapsibleRootChangeEventDetails) => void;
  /**
   * Whether the collapsible panel is currently open.
   */
  open: boolean;
  setMounted: (nextMounted: boolean) => void;
  setOpen: (nextOpen: boolean) => void;
  transitionStatus: TransitionStatus;
}

export interface UseCollapsiblePanelReturnValue {
  height: number | undefined;
  props: HTMLProps;
  ref: { current: HTMLElement | null };
  shouldPreventOpenAnimation: boolean;
  shouldRender: boolean;
  transitionStatus: TransitionStatus;
  width: number | undefined;
}
