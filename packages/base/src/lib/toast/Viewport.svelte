<script lang="ts">
  // Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { flushSync, untrack } from 'svelte';
  import { provider } from './context.js';
  import { selectors } from './store.js';
  import { activeElement, contains, getTarget, isFocusVisible } from './viewport-focus.js';
  import Element from '../dialog/Element.svelte';
  import type { ToastViewportProps } from './types.js';
  let { children, ref = $bindable(null), ...props }: ToastViewportProps = $props();
  const { store } = provider();
  let viewport = $state<HTMLElement | null>(null);
  let handlingFocusGuard = false;
  let markedReadyForMouseLeave = false;
  let touchActive = false;
  const snapshot = $derived(store.getSnapshot());
  const expanded = $derived(selectors.expanded(snapshot));
  const isEmpty = $derived(selectors.isEmpty(snapshot));
  const hasTransitioningToasts = $derived(snapshot.toasts.some(toast => toast.transitionStatus === 'ending'));
  const highPriorityToasts = $derived(snapshot.toasts.filter(toast => toast.priority === 'high'));
  const hiddenStyle = 'border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:fixed;white-space:nowrap;width:1px;top:0;left:0';
  function resumeTimersIfAllowed() {
    if (!selectors.expandedOrOutOfFocus(store.state)) store.resumeTimers();
  }
  function syncWindowFocus(node: HTMLElement) {
    store.set('isWindowFocused', node.ownerDocument.hasFocus());
    if (selectors.expandedOrOutOfFocus(store.state)) store.pauseTimers();
    else store.resumeTimers();
  }
  function restoreFocus() { store.state.prevFocusElement?.focus({ preventScroll: true }); }
  function closeFocus(toastId?: string) {
    const state = store.state;
    const node = state.viewport;
    if (!node) return;
    const current = activeElement(node.ownerDocument);
    if (!contains(node, current) || !isFocusVisible(current)) return;
    if (toastId === undefined) { restoreFocus(); return; }
    const findNextToast = () => {
      const toasts = store.state.toasts;
      const currentIndex = selectors.toastIndex(store.state, toastId);
      const scan = (from: number, step: number) => {
        for (let index = from; index >= 0 && index < toasts.length; index += step) {
          if (toasts[index].transitionStatus !== 'ending') return toasts[index];
        }
        return null;
      };
      return scan(currentIndex + 1, 1) ?? scan(currentIndex - 1, -1);
    };
    let nextToast = findNextToast();
    if (nextToast?.ref?.hasAttribute('inert') && !nextToast.limited) {
      // The complete onClose loop already ran. Commit the newly un-limited
      // successor before focus, then re-read ownership, focus and candidates.
      flushSync();
      const owner = store.state.viewport;
      const active = owner && activeElement(owner.ownerDocument);
      if (!owner || owner !== node || !owner.isConnected) return;
      // Missing animation APIs complete the exit during this flush. The browser
      // then falls back to body, but a connected outside focus target chosen by
      // consumer work must still win over successor focus.
      const exitedToBody = active === owner.ownerDocument.body && current && !current.isConnected;
      if (!exitedToBody && (!contains(owner, active) || !isFocusVisible(active))) return;
      nextToast = findNextToast();
    }
    if (nextToast) nextToast.ref?.focus();
    else restoreFocus();
  }
  function attach(node: HTMLElement) {
    viewport = node;
    store.set('viewport', node);
    syncWindowFocus(node);
    const unregister = store.setCloseFocusHandler(closeFocus);
    return () => {
      unregister();
      if (store.state.viewport === node) store.set('viewport', null);
      if (viewport === node) viewport = null;
    };
  }
  $effect(() => {
    const node = viewport;
    if (!node) return;
    const doc = node.ownerDocument;
    const win = doc.defaultView;
    if (!win) return;
    let focusTimeout: number | undefined;
    function blur(event: FocusEvent) {
      if (getTarget(event) !== win) return;
      win!.clearTimeout(focusTimeout);
      focusTimeout = undefined;
      store.set('isWindowFocused', false);
      store.pauseTimers();
    }
    function focus(event: FocusEvent) {
      if (event.relatedTarget) return;
      win!.clearTimeout(focusTimeout);
      focusTimeout = win!.setTimeout(() => {
        focusTimeout = undefined;
        // Captured descendant focus does not establish owner-window focus.
        // Re-read the document before publishing and resuming immediate adds.
        syncWindowFocus(node!);
      }, 0);
    }
    // Window focus remains observable while the mounted Viewport is empty.
    win.addEventListener('blur', blur, true);
    win.addEventListener('focus', focus, true);
    // Attachment and effect installation are separate commits; reconcile any
    // focus change that happened before these listeners were installed.
    untrack(() => syncWindowFocus(node));
    return () => {
      win.clearTimeout(focusTimeout);
      if (focusTimeout !== undefined && store.state.viewport === node) syncWindowFocus(node);
      win.removeEventListener('blur', blur, true);
      win.removeEventListener('focus', focus, true);
    };
  });
  $effect(() => {
    const node = viewport;
    if (!node || isEmpty) return;
    const doc = node.ownerDocument;
    const win = doc.defaultView;
    if (!win) return;
    function keydown(event: KeyboardEvent) {
      if (event.key === 'F6' && getTarget(event) !== node) {
        event.preventDefault();
        store.set('prevFocusElement', activeElement(doc) as HTMLElement | null);
        node?.focus({ preventScroll: true });
        store.pauseTimers();
        store.set('focused', true);
      }
    }
    function pointerdown(event: PointerEvent) {
      if (event.pointerType !== 'touch' || contains(store.state.viewport, getTarget(event))) return;
      store.update({ hovering: false, focused: false });
      resumeTimersIfAllowed();
    }
    win.addEventListener('keydown', keydown);
    doc.addEventListener('pointerdown', pointerdown, true);
    return () => {
      win.removeEventListener('keydown', keydown);
      doc.removeEventListener('pointerdown', pointerdown, true);
    };
  });
  function flushMouseLeave() {
    if (store.state.toasts.some(toast => toast.transitionStatus === 'ending') || touchActive || !markedReadyForMouseLeave) return;
    store.set('hovering', false);
    resumeTimersIfAllowed();
    markedReadyForMouseLeave = false;
  }
  $effect(() => { void hasTransitioningToasts; untrack(flushMouseLeave); });
  function mouseEnter() {
    store.pauseTimers(); store.set('hovering', true); markedReadyForMouseLeave = false;
  }
  function mouseLeave() { markedReadyForMouseLeave = true; flushMouseLeave(); }
  function pointerDown(event: PointerEvent) { if (event.pointerType === 'touch') touchActive = true; }
  function pointerEnd(event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    touchActive = false; flushMouseLeave();
  }
  function focus() {
    if (handlingFocusGuard) { handlingFocusGuard = false; return; }
    if (store.state.focused || !store.state.viewport) return;
    if (isFocusVisible(activeElement(store.state.viewport.ownerDocument))) {
      store.set('focused', true); store.pauseTimers();
    }
  }
  function blur(event: FocusEvent) {
    if (!store.state.focused || contains(store.state.viewport, event.relatedTarget)) return;
    store.set('focused', false);
    resumeTimersIfAllowed();
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Tab' && event.shiftKey && getTarget(event) === store.state.viewport) {
      event.preventDefault(); restoreFocus();
    }
  }
  function focusGuard(event: FocusEvent) {
    handlingFocusGuard = true;
    const first = event.relatedTarget === store.state.viewport
      ? store.state.toasts.find(toast => toast.transitionStatus !== 'ending' && !toast.limited)
      : undefined;
    if (first) first.ref?.focus(); else restoreFocus();
  }
</script>
{#snippet guard()}
  {#if !isEmpty && snapshot.prevFocusElement}
    <!-- A focus sentinel redirects keyboard navigation, matching pinned FocusGuard. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <span tabindex="0" aria-hidden="true" data-base-ui-focus-guard="" style={hiddenStyle} onfocus={focusGuard}></span>
  {/if}
{/snippet}
{@render guard()}
<Element {props} bind:ref {attach} state={{ expanded }} internal={{ tabindex: -1, role: 'region', 'aria-live': 'polite', 'aria-atomic': false, 'aria-relevant': 'additions text', 'aria-label': 'Notifications', 'data-expanded': expanded ? '' : undefined, onmouseenter: mouseEnter, onmousemove: mouseEnter, onmouseleave: mouseLeave, onfocusin: focus, onfocusout: blur, onkeydown: keydown, onclick: focus, onpointerdown: pointerDown, onpointerup: pointerEnd, onpointercancel: pointerEnd, style: { '--toast-frontmost-height': snapshot.toasts[0]?.height ? `${snapshot.toasts[0].height}px` : undefined } }}>
  {@render guard()}
  {@render children?.()}
  {@render guard()}
</Element>
{#if !snapshot.focused && highPriorityToasts.length > 0}
  <div style={hiddenStyle}>
    {#each highPriorityToasts as toast (toast.id)}
      <div role="alert" aria-atomic="true">
        <div>{#if typeof toast.title === 'function'}{@render toast.title()}{:else if typeof toast.title !== 'boolean'}{toast.title ?? ''}{/if}</div>
        <div>{#if typeof toast.description === 'function'}{@render toast.description()}{:else if typeof toast.description !== 'boolean'}{toast.description ?? ''}{/if}</div>
      </div>
    {/each}
  </div>
{/if}
