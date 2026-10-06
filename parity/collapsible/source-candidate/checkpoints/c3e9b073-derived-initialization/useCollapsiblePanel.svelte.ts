// Ported business body from Base UI v1.8.0 useCollapsiblePanel.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { DEV } from 'esm-env';
import { addEventListener } from '@sveltery/utils/addEventListener';
import { AnimationFrame } from '@sveltery/utils/useAnimationFrame';
import { warn } from '@sveltery/utils/warn';
import { ownerWindow } from '@sveltery/utils/owner';
import type { HTMLProps } from '../../internals/types.js';
import { REASONS } from '../../internals/reasons.js';
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

export class CollapsiblePanel implements UseCollapsiblePanelReturnValue {
  #parameters: UseCollapsiblePanelParameters;
  // Native attachments publish the actual reactive host owned by this class.
  readonly ref = $state<{ current: HTMLElement | null }>({ current: null });
  #animationType = $state.raw<AnimationType | null>(null);
  #dimensions = $state.raw<Dimensions>(EMPTY_DIMENSIONS);
  #lastMeasuredDimensions = $state.raw<Dimensions>(EMPTY_DIMENSIONS);
  #shouldSkipNextOpen = false;
  #shouldPreventMountAnimation = $state(false);
  #forcePanelIdle = $state(false);
  #skippedOpenMotion = $state.raw<
    { panel: HTMLElement; type: Exclude<AnimationType, 'none'> } | undefined
  >();
  #hidden = $derived(!this.#parameters.open && !this.#parameters.mounted);
  #panelTransitionStatus = $derived(
    this.#forcePanelIdle ? 'idle' : this.#parameters.transitionStatus,
  );
  #shouldPreventOpenAnimation = $derived(
    this.#parameters.open && this.#shouldPreventMountAnimation,
  );
  #renderedDimensions = $derived(
    !this.#parameters.open &&
      this.#parameters.mounted &&
      this.#animationType === 'css-animation' &&
      this.#dimensions.height === undefined &&
      this.#dimensions.width === undefined
      ? this.#lastMeasuredDimensions
      : this.#dimensions,
  );
  #shouldPersistHiddenTransitionStyles = $derived(
    this.#parameters.hiddenUntilFound && this.#hidden && this.#animationType !== 'css-animation',
  );
  #shouldRender = $derived(
    this.#parameters.keepMounted ||
      this.#parameters.hiddenUntilFound ||
      this.#parameters.mounted ||
      this.#parameters.open,
  );

  constructor(parameters: UseCollapsiblePanelParameters) {
    this.#parameters = parameters;
    // Initially open keyframes suppress their first paint until the first close.
    this.#shouldPreventMountAnimation = untrack(() => parameters.open);
    // Only used to handle panel close.
    const runOnceCloseAnimationsFinish = useAnimationsFinished(this.ref);

    $effect(() => {
      // `forcePanelIdle` is only a temporary override for open paths that skip
      // motion. Keep it active while the shared root still reports `starting`,
      // then drop it once the root transition state catches up.
      if (!this.#forcePanelIdle || parameters.transitionStatus === 'starting') {
        return;
      }

      this.#forcePanelIdle = false;
    });

    $effect(() => {
      const panel = this.ref.current;
      // Capture real business inputs before the imperative measurement boundary.
      void parameters.open;
      void parameters.mounted;
      void parameters.transitionStatus;
      void this.#shouldPreventOpenAnimation;
      if (!panel) {
        return undefined;
      }

      return untrack(() => {
        if (!parameters.open) this.#skippedOpenMotion = undefined;
        const animationType = getAnimationType(panel, this.#shouldPreventOpenAnimation);
        this.#animationType = animationType;

        // Initially open keyframe panels skip their first paint animation to avoid
        // layout shift, but we still need to cache the expanded size so the first
        // close animation can start from pixels instead of `auto`.
        if (
          parameters.open &&
          parameters.transitionStatus === 'idle' &&
          this.#shouldPreventMountAnimation &&
          animationType === 'css-animation'
        ) {
          this.#lastMeasuredDimensions = getDimensions(panel);
          return undefined;
        }

        // Handle the opening pass: measure the expanded size and, when necessary,
        // neutralize author-defined motion so the panel can open immediately.
        if (parameters.open && parameters.transitionStatus === 'starting') {
          // `beforematch` opens should reveal the panel immediately so find-in-page
          // does not wait for the author-defined transition or animation to finish.
          const skipNextOpen = this.#shouldSkipNextOpen;
          this.#shouldSkipNextOpen = false;

          if (animationType === 'none') {
            this.#setDimensions(getDimensions(panel));
            this.#forcePanelIdle = true;
            return undefined;
          }

          if (animationType === 'css-transition') {
            const restoreLayoutStyles = resetLayoutStyles(panel);
            this.#setDimensions(getDimensions(panel));

            if (!skipNextOpen) {
              return restoreLayoutStyles;
            }

            this.#skippedOpenMotion = { panel, type: animationType };
            this.#forcePanelIdle = true;
            return restoreLayoutStyles;
          }

          this.#setDimensions(getDimensions(panel));

          const restoreAnimationName = setTemporaryStyle(panel, 'animation-name', 'none');
          if (!skipNextOpen) {
            restoreAnimationName();
            return undefined;
          }

          this.#skippedOpenMotion = { panel, type: animationType };
          restoreAnimationName();
          this.#forcePanelIdle = true;

          return undefined;
        }

        // Capture the current size as soon as close is requested, before the
        // deferred ending phase applies closed styles. This keeps close transitions
        // starting from a measured pixel value, including interrupted opens.
        if (
          !parameters.open &&
          parameters.mounted &&
          (parameters.transitionStatus === 'idle' || parameters.transitionStatus === 'starting')
        ) {
          this.#shouldPreventMountAnimation = false;

          if (animationType === 'none') {
            this.#setDimensions(EMPTY_DIMENSIONS, false);
            parameters.setMounted(false);
            return undefined;
          }

          this.#setDimensions(getDimensions(panel));
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

        this.#setDimensions(nextDimensions);

        if (animationType === 'css-animation') {
          const restoreAnimationName = setTemporaryStyle(panel, 'animation-name', 'none');
          restoreAnimationName();
        }

        return undefined;
      });
    });

    // The shared completion options getter reads this live native owner.
    const isOpenChangeEnabled = () =>
      parameters.open && parameters.mounted && this.#panelTransitionStatus === 'idle';
    useOpenChangeComplete({
      get enabled() {
        return isOpenChangeEnabled();
      },
      open: true,
      ref: this.ref,
      onComplete: () => {
        // Retain the Source current-open guard against a finished microtask
        // racing the next close commit and animation-observer cleanup.
        // Clearing the measured size in that window would make the close transition start from
        // `height: 0` instead of the expanded pixel height.
        if (!parameters.open) {
          return;
        }

        this.#setDimensions(EMPTY_DIMENSIONS, false);
      },
    });

    // Closing panels need extra sequencing beyond `useOpenChangeComplete`.
    // This native post-DOM effect runs after the `ending` render has committed, so
    // `[data-ending-style]` is already present. Chrome can still register the
    // exit transition one frame later when an Accordion closes one item while
    // opening another, so wait one frame before watching animations.
    // See https://github.com/mui/base-ui/issues/3099
    $effect(() => {
      if (parameters.open || !parameters.mounted || this.#panelTransitionStatus !== 'ending') {
        return undefined;
      }

      const panel = this.ref.current;
      if (!panel) {
        return undefined;
      }

      const abortController = new AbortController();
      let endingStyleFrame = -1;

      const handleComplete = () => {
        // Native getters provide the current open value. Retain the Source
        // guard so a stale close completion cannot unmount a reopened panel.
        if (parameters.open) {
          return;
        }

        parameters.setMounted(false);
        this.#setDimensions(EMPTY_DIMENSIONS, false);
      };

      endingStyleFrame = AnimationFrame.request(() => {
        runOnceCloseAnimationsFinish(handleComplete, abortController.signal);
      });

      return () => {
        AnimationFrame.cancel(endingStyleFrame);
        abortController.abort();
      };
    });

    const registerBeforeMatchListener = () => {
      const onOpenChange = parameters.onOpenChange;
      const setOpen = parameters.setOpen;
      const panel = this.ref.current;
      if (!panel) {
        return undefined;
      }

      const handleBeforeMatch = (event: Event) => {
        const eventDetails = createChangeEventDetails(REASONS.none, event);

        onOpenChange(true, eventDetails);

        if (eventDetails.isCanceled) {
          return;
        }

        this.#shouldSkipNextOpen = true;
        setOpen(true);
      };

      return untrack(() => addEventListener(panel, 'beforematch', handleBeforeMatch));
    };
    $effect(registerBeforeMatchListener);
  }

  // Cache expanded measurements for later keyframe closes; false only clears
  // the current dimensions without discarding that source measurement cache.
  #setDimensions(nextDimensions: Dimensions, shouldCacheMeasurement: boolean = true) {
    if (shouldCacheMeasurement) {
      this.#lastMeasuredDimensions = nextDimensions;
    }
    this.#dimensions = nextDimensions;
  }

  get height() {
    return this.#renderedDimensions.height;
  }
  get width() {
    return this.#renderedDimensions.width;
  }
  get props(): HTMLProps {
    return {
      ...(this.#shouldPersistHiddenTransitionStyles
        ? { [CollapsiblePanelDataAttributes.startingStyle]: '' }
        : undefined),
      hidden: this.#hidden && this.#parameters.hiddenUntilFound ? 'until-found' : this.#hidden,
      id: this.#parameters.id,
    };
  }
  get shouldPreventOpenAnimation() {
    return this.#shouldPreventOpenAnimation;
  }
  get shouldRender() {
    return this.#shouldRender;
  }
  get transitionStatus() {
    return this.#panelTransitionStatus;
  }
  get skippedMotion() {
    return this.#parameters.open && this.#skippedOpenMotion?.panel === this.ref.current
      ? this.#skippedOpenMotion?.type
      : undefined;
  }
  // Arrow preserves the class receiver when passed as a detached attachment.
  attach = (host: HTMLElement) => {
    this.ref.current = host;
    return () => {
      if (this.#skippedOpenMotion?.panel === host) this.#skippedOpenMotion = undefined;
      if (this.ref.current === host) this.ref.current = null;
    };
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
  attach(host: HTMLElement): () => void;
  skippedMotion: Exclude<AnimationType, 'none'> | undefined;
  shouldPreventOpenAnimation: boolean;
  shouldRender: boolean;
  transitionStatus: TransitionStatus;
  width: number | undefined;
}
