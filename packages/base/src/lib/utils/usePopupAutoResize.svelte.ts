// Original usePopupAutoResize full measurement/restore/animation business (MIT).
import { onDestroy, untrack } from 'svelte';
import { AnimationFrame } from '@sveltery/utils/useAnimationFrame';

import { NOOP, EMPTY_OBJECT } from '@sveltery/utils/empty';
import { useAnimationsFinished } from '../internals/useAnimationsFinished.js';
import { getCssDimensions } from './getCssDimensions.js';
import type { Dimensions } from '@floating-ui/dom';
import type { Side } from '../internals/anchor-positioning/types.js';
import * as CommonPopupCssVars from './CommonPopupCssVars.js';
import * as CommonPositionerCssVars from './CommonPositionerCssVars.js';
/**
 * Allows the element to automatically resize based on its content while supporting animations.
 */
export function usePopupAutoResize(getParameters: () => UsePopupAutoResizeParameters) {
  const {
    popupElement,
    positionerElement,
    content,
    mounted,
    onMeasureLayout: onMeasureLayoutParam,
    onMeasureLayoutComplete: onMeasureLayoutCompleteParam,
    side,
    direction,
  } = $derived(getParameters());
  const runOnceAnimationsFinish = useAnimationsFinished(
    {
      get current() {
        return popupElement;
      },
    },
    () => true,
  );
  const animationFrame = new AnimationFrame();
  onDestroy(animationFrame.cancel);
  const committedDimensionsRef = { current: null as Dimensions | null };
  const isInitialRenderRef = { current: true };
  const restoreAnchoringStylesRef = { current: NOOP };
  const onMeasureLayout = () => onMeasureLayoutParam?.();
  const onMeasureLayoutComplete = (
    previousDimensions: Dimensions | null,
    newDimensions: Dimensions,
  ) => onMeasureLayoutCompleteParam?.(previousDimensions, newDimensions);
  const anchoringStyles = $derived.by(() => getPopupAnchoringStyles(side, direction));
  $effect(() => {
    // Changed content needs a fresh DOM measurement, even when the hosts stay mounted.
    void content;
    // Reset the state when the popup is closed.
    if (!mounted) {
      restoreAnchoringStylesRef.current = NOOP;
      isInitialRenderRef.current = true;
      committedDimensionsRef.current = null;
      return undefined;
    }
    if (!popupElement || !positionerElement) {
      return undefined;
    }
    restoreAnchoringStylesRef.current = applyElementStyles(
      popupElement,
      anchoringStyles as Record<string, string>,
    );
    // Measure the rendered size to enable transitions:
    setPopupCssSize(popupElement, 'auto');
    const restorePopupPosition = overrideElementStyle(popupElement, 'position', 'static');
    const restorePopupTransform = overrideElementStyle(popupElement, 'transform', 'none');
    const restorePopupScale = overrideElementStyle(popupElement, 'scale', '1');
    const restorePositionerAvailableSize = applyElementStyles(positionerElement, {
      [CommonPositionerCssVars.availableWidth]: 'max-content',
      [CommonPositionerCssVars.availableHeight]: 'max-content',
    });
    function restoreMeasurementOverrides() {
      restorePopupPosition();
      restorePopupTransform();
      restorePositionerAvailableSize();
    }
    function restoreMeasurementOverridesIncludingScale() {
      restoreMeasurementOverrides();
      restorePopupScale();
    }
    untrack(() => onMeasureLayout?.());
    // Initial render (for each time the popup opens).
    if (isInitialRenderRef.current || committedDimensionsRef.current === null) {
      setPositionerCssSize(positionerElement, 'max-content');
      const dimensions = getCssDimensions(popupElement);
      committedDimensionsRef.current = dimensions;
      setPositionerCssSize(positionerElement, dimensions);
      restoreMeasurementOverridesIncludingScale();
      untrack(() => onMeasureLayoutComplete?.(null, dimensions));
      isInitialRenderRef.current = false;
      return () => {
        restoreAnchoringStylesRef.current();
        restoreAnchoringStylesRef.current = NOOP;
      };
    }
    // Subsequent renders while open (when `content` changes).
    setPositionerCssSize(positionerElement, 'max-content');
    const previousDimensions = committedDimensionsRef.current;
    const newDimensions = getCssDimensions(popupElement);
    // Commit immediately so future content changes have a stable previous size.
    committedDimensionsRef.current = newDimensions;
    setPopupCssSize(popupElement, previousDimensions);
    restoreMeasurementOverridesIncludingScale();
    untrack(() => onMeasureLayoutComplete?.(previousDimensions, newDimensions));
    setPositionerCssSize(positionerElement, newDimensions);
    const abortController = new AbortController();
    animationFrame.request(() => {
      setPopupCssSize(popupElement, newDimensions);
      runOnceAnimationsFinish(() => {
        popupElement.style.setProperty(CommonPopupCssVars.popupWidth, 'auto');
        popupElement.style.setProperty(CommonPopupCssVars.popupHeight, 'auto');
      }, abortController.signal);
    });
    return () => {
      abortController.abort();
      animationFrame.cancel();
      restoreAnchoringStylesRef.current();
      restoreAnchoringStylesRef.current = NOOP;
    };
  });
}
interface UsePopupAutoResizeParameters {
  /**
   * Element to resize.
   */
  popupElement: HTMLElement | null;
  /*
   * Positioner element (parent of the popup)
   */
  positionerElement: HTMLElement | null;
  /**
   * Whether the popup is mounted.
   */
  mounted: boolean;
  /*
   * Content that may change and trigger a resize.
   * This doesn't have to be the actual content of the popup, but a value that triggers a resize.
   */
  content: unknown;
  /**
   * Callback fired immediately before measuring the dimensions of the new content.
   */
  onMeasureLayout?: (() => void) | undefined;
  /**
   * Callback fired after the new dimensions have been measured.
   *
   * @param previousDimensions Dimensions before the change, or `null` if this is the first measurement.
   * @param newDimensions Newly measured dimensions.
   */
  onMeasureLayoutComplete?:
    ((previousDimensions: Dimensions | null, newDimensions: Dimensions) => void) | undefined;
  side: Side;
  direction: 'ltr' | 'rtl';
}
function getPopupAnchoringStyles(side: Side, direction: 'ltr' | 'rtl'): Record<string, string> {
  // Ensure popup size transitions correctly when anchored to `bottom` (side=top) or `right` (side=left).
  const isPhysicalTop = side === 'top';
  const isPhysicalLeft =
    side === 'left' || side === (direction === 'rtl' ? 'inline-end' : 'inline-start');
  if (!isPhysicalTop && !isPhysicalLeft) {
    return EMPTY_OBJECT;
  }
  return {
    position: 'absolute',
    [isPhysicalTop ? 'bottom' : 'top']: '0',
    [isPhysicalLeft ? 'right' : 'left']: '0',
  };
}
function overrideElementStyle(element: HTMLElement, property: string, value: string) {
  const originalValue = element.style.getPropertyValue(property);
  element.style.setProperty(property, value);
  return () => {
    element.style.setProperty(property, originalValue);
  };
}
function applyElementStyles(element: HTMLElement, styles: Record<string, string>) {
  const restorers: Array<() => void> = [];
  for (const [key, value] of Object.entries(styles)) {
    restorers.push(overrideElementStyle(element, key, value));
  }
  return restorers.length
    ? () => {
        restorers.forEach((restore) => restore());
      }
    : NOOP;
}
function setPopupCssSize(popupElement: HTMLElement, size: Dimensions | 'auto') {
  const width = size === 'auto' ? 'auto' : `${size.width}px`;
  const height = size === 'auto' ? 'auto' : `${size.height}px`;
  popupElement.style.setProperty(CommonPopupCssVars.popupWidth, width);
  popupElement.style.setProperty(CommonPopupCssVars.popupHeight, height);
}
function setPositionerCssSize(positionerElement: HTMLElement, size: Dimensions | 'max-content') {
  const width = size === 'max-content' ? 'max-content' : `${size.width}px`;
  const height = size === 'max-content' ? 'max-content' : `${size.height}px`;
  positionerElement.style.setProperty(CommonPositionerCssVars.positionerWidth, width);
  positionerElement.style.setProperty(CommonPositionerCssVars.positionerHeight, height);
}
