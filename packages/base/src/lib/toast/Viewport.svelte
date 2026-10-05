<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';

  // Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { onDestroy, untrack } from 'svelte';
  import { provider } from './context.js';
  import { selectors } from './store.js';
  import { activeElement, contains, getTarget, isFocusVisible } from './viewport-focus.js';
  import type { ToastViewportProps } from './types.js';
  let { children, ref = $bindable(), ...props }: ToastViewportProps = $props();
  const { store } = provider();
  let viewport = $state<HTMLElement | null>(null);
  let handlingFocusGuard = false;
  let markedReadyForMouseLeave = false;
  let touchActive = false;
  let focusEventVersion = 0;
  let pendingBlur: { node: HTMLElement; source: Node | null; release: () => void } | undefined;
  let focusTimeout: { win: Window; id: number } | undefined;
  onDestroy(() => { pendingBlur = undefined; if (focusTimeout) focusTimeout.win.clearTimeout(focusTimeout.id); });
  const snapshot = $derived(store.getSnapshot());
  const expanded = $derived(selectors.expanded(snapshot));
  const isEmpty = $derived(selectors.isEmpty(snapshot));
  const hasTransitioningToasts = $derived(snapshot.toasts.some(toast => toast.transitionStatus === 'ending'));
  const highPriorityToasts = $derived(snapshot.toasts.filter(toast => toast.priority === 'high'));
  const hiddenStyle = 'border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:fixed;white-space:nowrap;width:1px;top:0;left:0';
  function settlePendingBlur() {
    const pending = pendingBlur;
    pendingBlur = undefined;
    if (pending?.node.isConnected && pending.source?.isConnected) pending.release();
  }
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
    function keydown(event: KeyboardEvent) {
      settlePendingBlur();
      if (event.key === 'F6' && getTarget(event) !== node) {
        event.preventDefault();
        store.set('prevFocusElement', activeElement(doc) as HTMLElement | null);
        node?.focus({ preventScroll: true });
        store.pauseTimers();
        store.set('focused', true);
      }
    }
    function blur(event: FocusEvent) {
      settlePendingBlur();
      if (getTarget(event) !== win) return;
      store.set('isWindowFocused', false);
      store.pauseTimers();
    }
    function focus(event: FocusEvent) {
      settlePendingBlur();
      if (event.relatedTarget) return;
      const target = getTarget(event);
      if (target === win || !contains(node, target) || !isFocusVisible(activeElement(doc))) store.resumeTimers();
      if (focusTimeout) focusTimeout.win.clearTimeout(focusTimeout.id);
      const id = win!.setTimeout(() => { focusTimeout = undefined; store.set('isWindowFocused', true); }, 0);
      focusTimeout = { win: win!, id };
    }
    function pointerdown(event: PointerEvent) {
      settlePendingBlur();
      if (event.pointerType !== 'touch' || contains(store.state.viewport, getTarget(event))) return;
      store.resumeTimers();
      store.update({ hovering: false, focused: false });
    }
    win.addEventListener('keydown', keydown);
    win.addEventListener('blur', blur, true);
    win.addEventListener('focus', focus, true);
    doc.addEventListener('pointerdown', pointerdown, true);
    return () => {
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
    settlePendingBlur();
    store.pauseTimers(); store.set('hovering', true); markedReadyForMouseLeave = false;
  }
  function mouseLeave() {
    settlePendingBlur(); markedReadyForMouseLeave = true; flushMouseLeave(); }
  function pointerDown(event: PointerEvent) {
    settlePendingBlur(); if (event.pointerType === 'touch') touchActive = true; }
  function pointerEnd(event: PointerEvent) {
    settlePendingBlur();
    if (event.pointerType !== 'touch') return;
    touchActive = false; flushMouseLeave();
  }
  function focus() {
    settlePendingBlur();
    focusEventVersion += 1;
    if (handlingFocusGuard) { handlingFocusGuard = false; return; }
    if (store.state.focused || !store.state.viewport) return;
    if (isFocusVisible(activeElement(store.state.viewport.ownerDocument))) {
      store.set('focused', true); store.pauseTimers();
    }
  }
  function blur(event: FocusEvent) {
    settlePendingBlur();
    const version = ++focusEventVersion;
    const node = viewport;
    const registration = store.getCloseFocusRegistration();
    if (!node || !registration || store.state.viewport !== node || !store.state.focused || contains(node, event.relatedTarget)) return;
    const release = () => {
      if (focusEventVersion !== version || viewport !== node || store.state.viewport !== node || store.getCloseFocusRegistration() !== registration) return;
      store.set('focused', false);
      if (store.state.isWindowFocused) store.resumeTimers();
    };
    if (event.relatedTarget !== null) { release(); return; }
    const source = getTarget(event) as Node | null;
    // Native removal dispatches focusout before disconnecting its source.
    // React suppresses that event during commit. Settle null-target releases
    // after this turn so only a still-mounted source can release the pause.
    const pending = { node, source, release };
    pendingBlur = pending;
    node.ownerDocument.defaultView?.queueMicrotask(() => {
      if (pendingBlur === pending) settlePendingBlur();
    });
  }
  function keydown(event: KeyboardEvent) {
    settlePendingBlur();
    if (event.key === 'Tab' && event.shiftKey && getTarget(event) === store.state.viewport) {
      event.preventDefault(); restoreFocus();
    }
  }
  function focusGuard(event: FocusEvent) {
    settlePendingBlur();
    handlingFocusGuard = true;
    const first = event.relatedTarget === store.state.viewport
      ? store.state.toasts.find(toast => toast.transitionStatus !== 'ending' && !toast.limited)
      : undefined;
    if (first) first.ref?.focus(); else restoreFocus();
  }

const renderState = $derived({ expanded });
const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    const disposeHost = (attach)(host);
    return () => untrack(() => {
      if (ref === host) ref = null;
      disposeHost?.();
    });
  });
}
const mergedProps = $derived.by(() => {
  const { class: className, style, ...attributes } = props;
  return { ...mergeComponentProps(renderState, { class: className, style }, [{ tabindex: -1, role: 'region', 'aria-live': 'polite', 'aria-atomic': false, 'aria-relevant': 'additions text', 'aria-label': 'Notifications', 'data-expanded': expanded ? '' : undefined, onmouseenter: mouseEnter, onmousemove: mouseEnter, onmouseleave: mouseLeave, onfocusin: focus, onfocusout: blur, onkeydown: keydown, onclick: focus, onpointerdown: pointerDown, onpointerup: pointerEnd, onpointercancel: pointerEnd, style: { '--toast-frontmost-height': snapshot.toasts[0]?.height ? `${snapshot.toasts[0].height}px` : undefined } }, attributes], false), [hostAttachmentKey]: attachHost };
});
</script>
{#snippet guard()}
  {#if !isEmpty && snapshot.prevFocusElement}
    <!-- A focus sentinel redirects keyboard navigation, matching pinned FocusGuard. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <span tabindex="0" aria-hidden="true" data-base-ui-focus-guard="" style={hiddenStyle} onfocus={focusGuard}></span>
  {/if}
{/snippet}
{@render guard()}
{#snippet hostChildren()}

  {@render guard()}
  {@render children?.()}
  {@render guard()}

{/snippet}
<div {...mergedProps}>{@render hostChildren?.()}</div>
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
