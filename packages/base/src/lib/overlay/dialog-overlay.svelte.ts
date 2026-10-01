import { untrack } from 'svelte';
import type { DialogController } from '../dialog/controller.svelte.js';
import type { FocusTarget, InteractionType } from '../dialog/types.js';
import { activeElement, tabbables } from './focus.js';
import { lockScroll } from './scroll-lock.js';
const stacks = new WeakMap<Document, DialogController[]>();
function focus(target: FocusTarget | undefined, method: InteractionType, fallback: () => HTMLElement | null | undefined) {
  const result = typeof target === 'function' ? target(method) : target;
  if (result === false || (typeof target === 'function' && result === undefined)) return;
  const element = result && typeof result === 'object' ? ('current' in result ? result.current ?? fallback() : result) : fallback();
  element?.focus({ preventScroll: true });
}
/** External DOM synchronization only: native listeners, focus, scroll locks and animation completion. */
export function attachOverlay(node: HTMLElement, controller: DialogController, options: () => { initialFocus?: FocusTarget; finalFocus?: FocusTarget }) {
  const document = node.ownerDocument;
  const window = document.defaultView!;
  controller.popup = node;
  if (controller.open) controller.presence = true;
  let disposed = false;
  let previousOpen = false;
  let observed = false;
  const initialMount = !controller.everMounted && controller.initialOpen;
  controller.everMounted = true;
  let focusedInside = false;
  let preventReturnFocus = false;
  let returnedFocus = false;
  function returnFocus() {
    if (returnedFocus) return;
    returnedFocus = true;
    if (!preventReturnFocus) focus(options().finalFocus, controller.closeMethod, () => controller.retainedTrigger?.isConnected ? controller.retainedTrigger : controller.trigger ?? controller.previousFocus);
  }
  let pointerDown = false;
  let composing = false;
  let compositionTimer: number | undefined;
  function compositionStart() { window.clearTimeout(compositionTimer); composing = true; }
  function compositionEnd() { compositionTimer = window.setTimeout(() => { composing = false; }, /AppleWebKit/.test(window.navigator.userAgent) && !/Chrome|Chromium|Edg/.test(window.navigator.userAgent) ? 5 : 0); }
  let generation = 0;
  let cycleVersion = controller.completionVersion;
  const frames: number[] = [];
  const frame = (callback: () => void) => { const id = window.requestAnimationFrame(() => { frames.splice(frames.indexOf(id), 1); callback(); }); frames.push(id); };
  const topmost = () => stacks.get(document)?.at(-1) === controller && controller.nestedCount === 0;
  const isInside = (event: Event) => event.composedPath().includes(node);
  const isTrigger = (event: Event) => {
    const path = event.composedPath();
    return [...controller.triggers.values()].some(trigger => path.includes(trigger));
  };
  function escape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || event.isComposing || composing || !controller.open || !topmost()) return;
    controller.closeMethod = 'keyboard';
    const details = controller.request(false, 'escape-key', event);
    if (!details.isPropagationAllowed) event.stopPropagation();
  }
  function tab(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !controller.open || !topmost() || controller.modal === false) return;
    const list = tabbables(node);
    const current = activeElement(document);
    if (!list.length) { event.preventDefault(); node.focus(); }
    else if (event.shiftKey && (current === list[0] || !list.includes(current!))) { event.preventDefault(); list.at(-1)!.focus(); }
    else if (!event.shiftKey && (current === list.at(-1) || !list.includes(current!))) { event.preventDefault(); list[0].focus(); }
  }
  let pressStartedOutside = false;
  function down(event: PointerEvent | MouseEvent) {
    pointerDown = true;
    pressStartedOutside = controller.open && topmost() && event.button === 0 && !isInside(event) && !isTrigger(event);
    if (pressStartedOutside && controller.modal === 'trap-focus' && !controller.backdrop && !controller.internalBackdrop) dismiss(event);
  }
  function dismiss(event: PointerEvent | MouseEvent) {
    if (!controller.open || !topmost() || controller.props().disablePointerDismissal || event.button !== 0 || isInside(event) || isTrigger(event)) return;
    const target = event.composedPath()[0];
    if (controller.modal && (controller.backdrop || controller.internalBackdrop) && target !== controller.backdrop && target !== controller.internalBackdrop) return;
    controller.closeMethod = 'mouse';
    controller.request(false, 'outside-press', event);
  }
  function up() { frame(() => { pointerDown = false; }); }
  function click(event: MouseEvent) { if (pressStartedOutside) dismiss(event); pressStartedOutside = false; pointerDown = false; }
  function focusIn(event: FocusEvent) {
    if (isInside(event)) focusedInside = true;
    else if (controller.open && topmost() && controller.modal === false && !controller.props().disablePointerDismissal && focusedInside && !pointerDown && !isTrigger(event)) {
      preventReturnFocus = true;
      const details = controller.request(false, 'focus-out', event);
      if (details.isCanceled) preventReturnFocus = false;
    }
  }
  const observer = new window.MutationObserver(() => {
    if (controller.open && topmost() && focusedInside && activeElement(document) === document.body) node.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', escape);
  document.addEventListener('compositionstart', compositionStart);
  document.addEventListener('compositionend', compositionEnd);
  document.addEventListener('keydown', tab);
  document.addEventListener('pointerdown', down, true);
  document.addEventListener('mousedown', down, true);
  document.addEventListener('click', click, true);
  document.addEventListener('pointerup', up, true);
  document.addEventListener('mouseup', up, true);
  document.addEventListener('focusin', focusIn);
  observer.observe(node, { subtree: true, childList: true });
  const stop = $effect.root(() => {
    $effect(() => {
      const open = controller.open;
      if (!open) return;
      const stack = stacks.get(document) ?? [];
      stack.push(controller); stacks.set(document, stack);
      return () => { const index = stack.indexOf(controller); if (index !== -1) stack.splice(index, 1); };
    });
    $effect(() => {
      if (controller.open && controller.modal === true) return lockScroll(document);
    });
    $effect(() => {
      const open = controller.open;
      // Reads unrelated to open are intentionally untracked: prop updates don't replay focus entry.
      untrack(() => {
        if (observed && open === previousOpen) return;
        const initiallyOpen = !observed && open && initialMount;
        observed = true; previousOpen = open;
        const token = ++generation;
        if (open) {
          controller.beginOpenCycle();
          const completionVersion = controller.completionVersion;
          cycleVersion = completionVersion;
          controller.presence = true;
          controller.starting = !initiallyOpen;
          controller.previousFocus = activeElement(document);
          preventReturnFocus = false;
          returnedFocus = false;
          frame(() => {
            if (disposed || token !== generation || !controller.open) return;
            focus(options().initialFocus, controller.method, () => controller.method === 'touch' ? node : tabbables(node)[0] ?? node);
            focusedInside = node.contains(activeElement(document));
            // Resolve starting style before removing it so the browser can establish an enter transition.
            window.getComputedStyle(node).getPropertyValue('opacity');
            controller.starting = false;
            frame(() => { void finish(true, token, completionVersion); });
          });
        } else if (controller.mounted || controller.retainedTrigger || controller.previousFocus) {
          returnFocus();
          // An imperative unmount may precede this DOM effect in the same turn.
          if (controller.completionVersion !== cycleVersion) return;
          controller.presence = true;
          const completionVersion = controller.completionVersion;
          frame(() => { void finish(false, token, completionVersion); });
        }
      });
    });
  });
  async function finish(open: boolean, token: number, completionVersion: number) {
    // Reinspect after canceled/replaced animations; never complete a stale generation.
    while (!disposed && token === generation && completionVersion === controller.completionVersion) {
      const animations = node.getAnimations?.().filter(a => a.playState !== 'finished' && a.playState !== 'idle') ?? [];
      if (!animations.length) break;
      await Promise.allSettled(animations.map(a => a.finished));
    }
    if (disposed || token !== generation || completionVersion !== controller.completionVersion || controller.open !== open) return;
    controller.starting = false;
    if (!open) { if (!controller.deferred) controller.unmount(); }
    else controller.props().onOpenChangeComplete?.(true);
  }
  return () => {
    disposed = true; generation++;
    window.clearTimeout(compositionTimer);
    frames.forEach(id => window.cancelAnimationFrame(id)); frames.length = 0;
    stop(); observer.disconnect();
    document.removeEventListener('keydown', escape); document.removeEventListener('keydown', tab);
    document.removeEventListener('compositionstart', compositionStart); document.removeEventListener('compositionend', compositionEnd);
    document.removeEventListener('pointerdown', down, true); document.removeEventListener('mousedown', down, true);
    document.removeEventListener('click', click, true);
    document.removeEventListener('pointerup', up, true); document.removeEventListener('mouseup', up, true); document.removeEventListener('focusin', focusIn);
    // A conditional Portal/Popup removal can destroy this attachment without a close edge.
    if (observed && previousOpen) returnFocus();
    if (controller.popup === node) controller.popup = null;
  };
}
