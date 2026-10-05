// Derived from mui/base-ui v1.8.0 useAnimationsFinished/useCollapsiblePanel,
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { DEV } from 'esm-env';

export type AnimationType = 'css-transition' | 'css-animation' | 'none';
const warnings = new Set<string>();

/** Matches the pinned development-only, once-per-message warning contract. */
export function warnOnce(...messages: string[]) {
  if (!DEV) return;
  const message = `Base UI: ${messages.join(' ')}`;
  if (warnings.has(message)) return;
  warnings.add(message);
  console.warn(message);
}

/** A frame is owned by the actual element's window and by its lifecycle cleanup. */
export function requestFrame(element: HTMLElement, callback: () => void): () => void {
  const ownerWindow = element.ownerDocument.defaultView;
  if (!ownerWindow) return () => {};
  const frame = ownerWindow.requestAnimationFrame(callback);
  return () => ownerWindow.cancelAnimationFrame(frame);
}

/** Observe replacements after cancellation, and never complete a disposed lifecycle. */
export function afterAnimations(
  element: HTMLElement,
  complete: () => void,
  waitForStartingStyleRemoved = false,
  signal: AbortSignal | null = null,
): () => void {
  const ownedController = signal ? undefined : new AbortController();
  const lifecycleSignal = signal ?? ownedController?.signal;
  let cancelFrame: (() => void) | undefined;
  let observer: MutationObserver | undefined;
  const done = () => {
    if (!lifecycleSignal?.aborted) flushSync(complete);
  };
  function observe() {
    if (lifecycleSignal?.aborted) return;
    Promise.all(element.getAnimations().map(animation => animation.finished)).then(done, () => {
      if (lifecycleSignal?.aborted) return;
      const current = element.getAnimations();
      if (current.some(animation => animation.pending || animation.playState !== 'finished')) {
        observe();
      } else {
        done();
      }
    });
  }
  const animationsDisabled = (globalThis as typeof globalThis & {
    BASE_UI_ANIMATIONS_DISABLED?: boolean;
  }).BASE_UI_ANIMATIONS_DISABLED;
  if (typeof element.getAnimations !== 'function' || animationsDisabled) {
    complete();
  } else if (waitForStartingStyleRemoved && element.hasAttribute('data-starting-style')) {
    const Observer = element.ownerDocument.defaultView?.MutationObserver;
    if (Observer) {
      observer = new Observer(() => {
        if (!element.hasAttribute('data-starting-style')) {
          observer?.disconnect();
          observe();
        }
      });
      observer.observe(element, { attributes: true, attributeFilter: ['data-starting-style'] });
      lifecycleSignal?.addEventListener('abort', () => observer?.disconnect(), { once: true });
    } else {
      cancelFrame = requestFrame(element, observe);
    }
  } else {
    cancelFrame = requestFrame(element, observe);
  }
  return () => {
    ownedController?.abort();
    cancelFrame?.();
    observer?.disconnect();
  };
}

export function getDimensions(element: HTMLElement) {
  return { height: element.scrollHeight, width: element.scrollWidth };
}

export function getAnimationType(element: HTMLElement, hasSuppressedMountAnimation: boolean): AnimationType {
  const styles = element.ownerDocument.defaultView?.getComputedStyle(element);
  if (!styles) return 'none';
  const hasAnimation = (styles.animationName.split(',').some(name => name.trim() !== '' && name.trim() !== 'none') || hasSuppressedMountAnimation)
    && hasNonZeroDuration(styles.animationDuration);
  const hasTransition = hasNonZeroDuration(styles.transitionDuration);
  if (hasAnimation && hasTransition) {
    warnOnce('CSS transitions and CSS animations both detected on Collapsible or Accordion panel.', 'Only one of either animation type should be used.');
    return 'css-transition';
  }
  if (hasTransition) return 'css-transition';
  if (hasAnimation) return 'css-animation';
  return 'none';
}

function hasNonZeroDuration(value: string) {
  return value.split(',').some(part => part.trim() !== '' && Number.parseFloat(part) > 0);
}

export function setTemporaryStyle(element: HTMLElement, property: string, value: string): () => void {
  const previousValue = element.style.getPropertyValue(property);
  const previousPriority = element.style.getPropertyPriority(property);
  element.style.setProperty(property, value);
  return () => {
    if (previousValue === '') element.style.removeProperty(property);
    else element.style.setProperty(property, previousValue, previousPriority);
  };
}

export function resetLayoutStyles(element: HTMLElement): () => void {
  // Deliberately preserve the pinned value-only restoration. Authored inline
  // !important priority on these alignment properties is not cached upstream.
  const original = {
    'justify-content': element.style.justifyContent,
    'align-items': element.style.alignItems,
    'align-content': element.style.alignContent,
    'justify-items': element.style.justifyItems,
  };
  for (const property of Object.keys(original)) element.style.setProperty(property, 'initial', 'important');
  const restore = () => {
    for (const [property, value] of Object.entries(original)) {
      if (value === '') element.style.removeProperty(property);
      else element.style.setProperty(property, value);
    }
  };
  const cancel = requestFrame(element, restore);
  return () => { cancel(); restore(); };
}

/**
 * React diffs style objects property by property; Svelte assigns CSS strings as
 * cssText. Preserve an imperative value when its authored value did not change,
 * so updating the measured CSS variables cannot erase temporary motion/layout
 * overrides (or restore an alignment priority the pinned source discarded).
 * Call before the DOM update, then invoke the returned function after it.
 */
export function preserveUnchangedInlineStyles(
  element: HTMLElement,
  previousStyle: string | undefined,
  nextStyle: string,
): () => void {
  const previous = element.ownerDocument.createElement('div').style;
  const next = element.ownerDocument.createElement('div').style;
  previous.cssText = previousStyle ?? '';
  next.cssText = nextStyle;
  const properties = new Set([...Array.from(element.style), ...Array.from(previous), ...Array.from(next)]);
  const preserved: Array<[string, string, string]> = [];
  for (const property of properties) {
    if (previous.getPropertyValue(property) !== next.getPropertyValue(property)
      || previous.getPropertyPriority(property) !== next.getPropertyPriority(property)) continue;
    preserved.push([property, element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
  }
  return () => {
    for (const [property, value, priority] of preserved) {
      if (value === '') element.style.removeProperty(property);
      else element.style.setProperty(property, value, priority);
    }
  };
}
