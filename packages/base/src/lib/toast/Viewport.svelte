<script lang="ts">
  // Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
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
  function restoreFocus() { store.state.prevFocusElement?.focus({ preventScroll: true }); }
  function closeFocus(toastId?: string) {
    const state = store.state;
    const node = state.viewport;
    if (!node) return;
    const current = activeElement(node.ownerDocument);
    if (!contains(node, current) || !isFocusVisible(current)) return;
    if (toastId === undefined) { restoreFocus(); return; }
    const toasts = store.state.toasts;
    const currentIndex = selectors.toastIndex(store.state, toastId);
    const scan = (from: number, step: number) => {
      for (let index = from; index >= 0 && index < toasts.length; index += step) {
        if (toasts[index].transitionStatus !== 'ending') return toasts[index];
      }
      return null;
    };
    const nextToast = scan(currentIndex + 1, 1) ?? scan(currentIndex - 1, -1);
    if (nextToast) nextToast.ref?.focus();
    else restoreFocus();
  }
  function attach(node: HTMLElement) {
    viewport = node;
    store.set('viewport', node);
    const unregister = store.setCloseFocusHandler(closeFocus);
    return () => {
      unregister();
      if (store.state.viewport === node) store.set('viewport', null);
      if (viewport === node) viewport = null;
    };
  }
  $effect(() => {
    const node = viewport;
    if (!node || isEmpty) return;
    const doc = node.ownerDocument;
    const win = doc.defaultView;
    if (!win) return;
    let focusTimeout: number | undefined;
    function keydown(event: KeyboardEvent) {
      if (event.key === 'F6' && getTarget(event) !== node) {
        event.preventDefault();
        store.set('prevFocusElement', activeElement(doc) as HTMLElement | null);
        node?.focus({ preventScroll: true });
        store.pauseTimers();
        store.set('focused', true);
      }
    }
    function blur(event: FocusEvent) {
      if (getTarget(event) !== win) return;
      store.set('isWindowFocused', false);
      store.pauseTimers();
    }
    function focus(event: FocusEvent) {
      if (event.relatedTarget) return;
      const target = getTarget(event);
      if (target === win || !contains(node, target) || !isFocusVisible(activeElement(doc))) store.resumeTimers();
      win!.clearTimeout(focusTimeout);
      focusTimeout = win!.setTimeout(() => store.set('isWindowFocused', true), 0);
    }
    function pointerdown(event: PointerEvent) {
      if (event.pointerType !== 'touch' || contains(store.state.viewport, getTarget(event))) return;
      store.resumeTimers();
      store.update({ hovering: false, focused: false });
    }
    win.addEventListener('keydown', keydown);
    win.addEventListener('blur', blur, true);
    win.addEventListener('focus', focus, true);
    doc.addEventListener('pointerdown', pointerdown, true);
    return () => {
      win.clearTimeout(focusTimeout);
      win.removeEventListener('keydown', keydown);
      win.removeEventListener('blur', blur, true);
      win.removeEventListener('focus', focus, true);
      doc.removeEventListener('pointerdown', pointerdown, true);
    };
  });
  function flushMouseLeave() {
    if (store.state.toasts.some(toast => toast.transitionStatus === 'ending') || touchActive || !markedReadyForMouseLeave) return;
    if (store.state.isWindowFocused) store.resumeTimers();
    store.set('hovering', false);
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
    if (store.state.isWindowFocused) store.resumeTimers();
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
