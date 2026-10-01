import { untrack } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import type { DialogController } from '../dialog/controller.svelte.js';
import type { FocusTarget, InteractionType } from '../dialog/types.js';
import type { PortalContext } from '../dialog/context.js';
import { activeElement, contains, tabbables } from './focus.js';
import { lockScroll } from './scroll-lock.js';
import { isolateDialog } from './isolation.js';
const stacks = new WeakMap<Document, DialogController[]>();
function focus(target: FocusTarget | undefined, method: InteractionType, fallback: () => HTMLElement | null | undefined) {
  const result = typeof target === 'function' ? target(method) : target;
  if (result === false || (typeof target === 'function' && result === undefined)) return;
  const element = result && typeof result === 'object' ? ('current' in result ? result.current ?? fallback() : result) : fallback();
  element?.focus({ preventScroll: true });
}
/** External DOM synchronization only: native listeners, focus, scroll locks and animation completion. */
export function attachOverlay(node: HTMLElement, controller: DialogController, options: () => { initialFocus?: FocusTarget; finalFocus?: FocusTarget }, portalContext: PortalContext) {
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
  function returnFocus(detaching = false) {
    if (returnedFocus) return;
    returnedFocus = true;
    const target = options().finalFocus;
    // Conditional removal must respect focus already placed outside by the owner.
    // Explicit targets/callbacks intentionally override this default-return guard.
    if (detaching && (target === undefined || typeof target === 'boolean')) {
      const current = activeElement(document);
      if (current && current !== document.body && !contains(node, current)) return;
    }
    if (!preventReturnFocus) focus(target, controller.closeMethod, () => controller.retainedTrigger?.isConnected ? controller.retainedTrigger : controller.trigger ?? controller.previousFocus);
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
  function closeOnFocusOut(event: FocusEvent) {
    if (disposed || !controller.open || !topmost() || controller.modal !== false || controller.props().disablePointerDismissal) return;
    preventReturnFocus = true;
    controller.closeMethod = 'keyboard';
    const details = controller.request(false, 'focus-out', event);
    if (details.isCanceled) preventReturnFocus = false;
  }
  const focusManager = { node, guards: new SvelteSet<HTMLElement>(), reference: () => controller.trigger, setPreventReturnFocus: (value: boolean) => { if (!controller.props().disablePointerDismissal) preventReturnFocus = value; }, closeOnFocusOut };
  portalContext.focusManager = focusManager;
  function escape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || event.isComposing || composing || !controller.open || !topmost()) return;
    controller.closeMethod = 'keyboard';
    const details = controller.request(false, 'escape-key', event);
    if (!details.isPropagationAllowed) event.stopPropagation();
  }
  let beforeModalGuard: HTMLElement | null = null;
  let afterModalGuard: HTMLElement | null = null;
  function tab(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !controller.open || !topmost() || controller.modal === false) return;
    const list = tabbables(node);
    const current = activeElement(document);
    if (!list.length) { event.preventDefault(); node.focus(); }
    // Native media have multiple internal controls with the same retargeted
    // active element. Let their own Tab sequence reach the adjacent guard.
    else if (current?.matches('audio[controls],video[controls]') && list.includes(current)) return;
    else if (event.shiftKey && (current === list[0] || !list.includes(current!))) { event.preventDefault(); (beforeModalGuard ?? list.at(-1)!).focus(); }
    else if (!event.shiftKey && (current === list.at(-1) || !list.includes(current!))) { event.preventDefault(); (afterModalGuard ?? list[0]).focus(); }
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
  }
  function focusOut(event: FocusEvent) {
    // Upstream listens to the owning reference's focusout. Popup capture marks
    // programmatic movement in the logical tree; owned guards handle Tab exits.
    if (!event.composedPath().includes(controller.trigger!)) return;
    const related = event.relatedTarget as Node | null;
    queueMicrotask(() => {
      if (!related || contains(node, activeElement(document)) || contains(portalContext.node, activeElement(document)) || pointerDown || related === controller.previousFocus || contains(node, related) || contains(portalContext.node, related) || [...controller.triggers.values()].some(trigger => contains(trigger, related)) || focusManager.guards.has(related as HTMLElement)) return;
      for (let parent = controller.parent; parent; parent = parent.parent) if (related === parent.popup || related === parent.trigger) return;
      closeOnFocusOut(event);
    });
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
      const trigger = controller.trigger;
      if (!trigger) return;
      // Match the native reference listener: consumer propagation control at
      // an ancestor must not suppress the owning Trigger's focusout handling.
      trigger.addEventListener('focusout', focusOut);
      return () => { trigger.removeEventListener('focusout', focusOut); };
    });
    $effect(() => {
      const open = controller.open;
      if (!open) return;
      const stack = stacks.get(document) ?? [];
      stack.push(controller); stacks.set(document, stack);
      return () => { const index = stack.indexOf(controller); if (index !== -1) stack.splice(index, 1); };
    });
    $effect(() => {
      if (!controller.open || controller.modal === false) return;
      function guard(direction: 1 | -1) {
        const element = document.createElement('span');
        element.tabIndex = 0;
        // Pinned FocusGuard exposes role-button guards on Apple WebKit so
        // VoiceOver's virtual cursor can trigger the focus trap.
        const platform = (window.navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? window.navigator.platform;
        const apple = /^mac|^i(os$|p)/i.test(platform);
        if (apple && window.CSS?.supports?.('-webkit-backdrop-filter:none')) element.setAttribute('role', 'button');
        else element.setAttribute('aria-hidden', 'true');
        element.setAttribute('data-base-ui-focus-guard', '');
        element.dataset.type = 'inside';
        element.style.cssText = 'border:0;clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:fixed;white-space:nowrap;width:1px;top:0;left:0';
        element.addEventListener('focusin', () => {
          if (!controller.open || !topmost()) return;
          const list = tabbables(node);
          // Like pinned FloatingFocusManager, use native candidate focus. An
          // implicit details summary cannot be focused by details.focus().
          (direction === 1 ? list[0] : list.at(-1))?.focus({ preventScroll: true });
        });
        focusManager.guards.add(element);
        return element;
      }
      const before = guard(-1);
      const after = guard(1);
      beforeModalGuard = before; afterModalGuard = after;
      node.before(before); node.after(after);
      return () => {
        beforeModalGuard = null; afterModalGuard = null;
        for (const element of [before, after]) { focusManager.guards.delete(element); element.remove(); }
      };
    });
    $effect(() => {
      if (controller.open && controller.modal === true) return lockScroll(document);
    });
    $effect(() => {
      if (controller.open) return isolateDialog(node, controller.modal !== false, [...focusManager.guards]);
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
            focusedInside = contains(node, activeElement(document));
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
    if (portalContext.focusManager === focusManager) portalContext.focusManager = null;
    // A conditional Portal/Popup removal can destroy this attachment without a close edge.
    if (observed && previousOpen) returnFocus(true);
    if (controller.popup === node) controller.popup = null;
  };
}
