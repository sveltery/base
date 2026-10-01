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
  let pointerDown = false;
  let generation = 0;
  const frames = new Set<number>();
  const frame = (callback: () => void) => { const id = window.requestAnimationFrame(() => { frames.delete(id); callback(); }); frames.add(id); };
  const topmost = () => stacks.get(document)?.at(-1) === controller && controller.nestedCount === 0;
  const isInside = (event: Event) => event.composedPath().includes(node);
  function escape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !controller.open || !topmost()) return;
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
    pressStartedOutside = controller.open && topmost() && event.button === 0 && !isInside(event) && !event.composedPath().includes(controller.trigger!);
    if (pressStartedOutside && controller.modal === 'trap-focus' && !controller.backdrop && !controller.internalBackdrop) dismiss(event);
  }
  function dismiss(event: PointerEvent | MouseEvent) {
    if (!controller.open || !topmost() || controller.props().disablePointerDismissal || event.button !== 0 || isInside(event) || event.composedPath().includes(controller.trigger!)) return;
    const target = event.composedPath()[0];
    if (controller.modal && (controller.backdrop || controller.internalBackdrop) && target !== controller.backdrop && target !== controller.internalBackdrop) return;
    controller.closeMethod = 'mouse';
    controller.request(false, 'outside-press', event);
  }
  function up() { frame(() => { pointerDown = false; }); }
  function click(event: MouseEvent) { if (pressStartedOutside) dismiss(event); pressStartedOutside = false; pointerDown = false; }
  function focusIn(event: FocusEvent) {
    if (isInside(event)) focusedInside = true;
    else if (controller.open && topmost() && controller.modal === false && !controller.props().disablePointerDismissal && focusedInside && !pointerDown && !event.composedPath().includes(controller.trigger!)) {
      preventReturnFocus = true;
      const details = controller.request(false, 'focus-out', event);
      if (details.isCanceled) preventReturnFocus = false;
    }
  }
  const observer = new window.MutationObserver(() => {
    if (controller.open && topmost() && focusedInside && activeElement(document) === document.body) node.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', escape);
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
      const modal = controller.modal;
      if (!open) return;
      const stack = stacks.get(document) ?? [];
      stack.push(controller); stacks.set(document, stack);
      const unlock = modal === true ? lockScroll(document) : () => {};
      return () => { const index = stack.indexOf(controller); if (index !== -1) stack.splice(index, 1); unlock(); };
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
          controller.presence = true;
          controller.starting = !initiallyOpen;
          controller.previousFocus = activeElement(document);
          preventReturnFocus = false;
          frame(() => {
            if (disposed || token !== generation || !controller.open) return;
            focus(options().initialFocus, controller.method, () => controller.method === 'touch' ? node : tabbables(node)[0] ?? node);
            focusedInside = node.contains(activeElement(document));
            // Resolve starting style before removing it so the browser can establish an enter transition.
            window.getComputedStyle(node).getPropertyValue('opacity');
            controller.starting = false;
            frame(() => { void finish(true, token); });
          });
        } else if (controller.mounted || controller.retainedTrigger || controller.previousFocus) {
          controller.presence = true;
          if (!preventReturnFocus) focus(options().finalFocus, controller.closeMethod, () => controller.retainedTrigger?.isConnected ? controller.retainedTrigger : controller.trigger ?? controller.previousFocus);
          frame(() => { void finish(false, token); });
        }
      });
    });
  });
  async function finish(open: boolean, token: number) {
    // Reinspect after canceled/replaced animations; never complete a stale generation.
    while (!disposed && token === generation) {
      const animations = node.getAnimations?.({ subtree: true }).filter(a => a.playState !== 'finished' && a.playState !== 'idle') ?? [];
      if (!animations.length) break;
      await Promise.allSettled(animations.map(a => a.finished));
    }
    if (disposed || token !== generation || controller.open !== open) return;
    controller.starting = false;
    if (!open) { if (!controller.deferred) controller.unmount(); }
    else controller.props().onOpenChangeComplete?.(true);
  }
  return () => {
    disposed = true; generation++;
    frames.forEach(id => window.cancelAnimationFrame(id)); frames.clear();
    stop(); observer.disconnect();
    document.removeEventListener('keydown', escape); document.removeEventListener('keydown', tab);
    document.removeEventListener('pointerdown', down, true); document.removeEventListener('mousedown', down, true);
    document.removeEventListener('click', click, true);
    document.removeEventListener('pointerup', up, true); document.removeEventListener('mouseup', up, true); document.removeEventListener('focusin', focusIn);
    if (controller.popup === node) controller.popup = null;
  };
}
