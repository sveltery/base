<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { onDestroy, untrack } from 'svelte';
  import { addEventListener } from '@sveltery/utils/addEventListener';
  import { mergeCleanups } from '@sveltery/utils/mergeCleanups';
  import { ownerDocument, ownerWindow } from '@sveltery/utils/owner';
  import { visuallyHidden } from '@sveltery/utils/visuallyHidden';
  import { Timeout } from '@sveltery/utils/useTimeout';
  import { activeElement, contains, getTarget } from '@sveltery/utils/shadowDom';
  import { matchesFocusVisible as isFocusVisible } from '../floating-ui/utils/matchesFocusVisible.js';
  import { toNativeStyle } from '../internals/nativeProps.js';
  import FocusGuard from '../utils/FocusGuard.svelte';
  import { provider } from './context.js';
  import type { ToastViewportProps } from './types.js';
  let { render, children, ref = $bindable(), ...props }: ToastViewportProps = $props();
  const { store } = provider();
  let viewport = $state<HTMLElement | null>(null);
  const windowFocusTimeout = new Timeout();
  onDestroy(windowFocusTimeout.clear);
  let handlingFocusGuard = false;
  let markedReadyForMouseLeave = false;
  let touchActive = false;
  const isEmpty = $derived(store.useState('isEmpty'));
  const toasts = $derived(store.useState('toasts'));
  const focused = $derived(store.useState('focused'));
  const expanded = $derived(store.useState('expanded'));
  const prevFocusElement = $derived(store.useState('prevFocusElement'));
  const hasTransitioningToasts = $derived(
    toasts.some((toast) => toast.transitionStatus === 'ending'),
  );
  const highPriorityToasts = $derived(toasts.filter((toast) => toast.priority === 'high'));
  const hiddenStyle = toNativeStyle(visuallyHidden);

  function attach(node: HTMLElement) {
    viewport = node;
    store.setViewport(node);
    return () => {
      if (store.state.viewport === node) store.setViewport(null);
      if (viewport === node) viewport = null;
    };
  }
  $effect(() => {
    const node = viewport;
    if (!node || isEmpty) return;
    const win = ownerWindow(node);
    const doc = ownerDocument(node);
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (event.key === 'F6' && getTarget(event) !== node) {
        event.preventDefault();
        store.set('prevFocusElement', activeElement(doc) as HTMLElement | null);
        node?.focus({ preventScroll: true });
        store.pauseTimers();
        store.set('focused', true);
      }
    }
    function handleWindowBlur(event: FocusEvent) {
      if (getTarget(event) !== win) return;
      store.set('isWindowFocused', false);
      store.pauseTimers();
    }
    function handleWindowFocus(event: FocusEvent) {
      if (event.relatedTarget) return;
      const target = getTarget(event);
      const activeEl = activeElement(ownerDocument(node));
      if (
        target === win ||
        !contains(node, target as Element | null) ||
        !isFocusVisible(activeEl)
      ) {
        store.resumeTimers();
      }
      windowFocusTimeout.start(0, () => store.set('isWindowFocused', true));
    }
    return mergeCleanups(
      addEventListener(win, 'keydown', handleGlobalKeyDown),
      addEventListener(win, 'blur', handleWindowBlur, true),
      addEventListener(win, 'focus', handleWindowFocus, true),
      addEventListener(doc, 'pointerdown', store.handleDocumentPointerDown, true),
    );
  });
  function handleFocusGuard(event: FocusEvent) {
    handlingFocusGuard = true;
    const firstFocusableToast =
      event.relatedTarget === store.state.viewport
        ? toasts.find((toast) => toast.transitionStatus !== 'ending' && !toast.limited)
        : undefined;
    if (firstFocusableToast) firstFocusableToast.ref?.focus();
    else store.restoreFocusToPrevElement();
  }
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && event.shiftKey && getTarget(event) === store.state.viewport) {
      event.preventDefault();
      store.restoreFocusToPrevElement();
    }
  }
  function flushMouseLeave() {
    const hasEndingToasts = store.state.toasts.some((toast) => toast.transitionStatus === 'ending');
    if (hasEndingToasts || touchActive || !markedReadyForMouseLeave) return;
    if (store.state.isWindowFocused) store.resumeTimers();
    store.set('hovering', false);
    markedReadyForMouseLeave = false;
  }
  $effect(() => {
    void hasTransitioningToasts;
    untrack(flushMouseLeave);
  });
  function handleMouseEnter() {
    store.pauseTimers();
    store.set('hovering', true);
    markedReadyForMouseLeave = false;
  }
  function resumeTimersIfWindowFocused() {
    if (store.state.isWindowFocused) store.resumeTimers();
  }
  function handleMouseLeave() {
    markedReadyForMouseLeave = true;
    flushMouseLeave();
  }
  function handlePointerDown(event: PointerEvent) {
    if (event.pointerType === 'touch') touchActive = true;
  }
  function handlePointerEnd(event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    touchActive = false;
    flushMouseLeave();
  }
  function handleFocus() {
    if (handlingFocusGuard) {
      handlingFocusGuard = false;
      return;
    }
    if (focused) return;
    if (isFocusVisible(activeElement(ownerDocument(store.state.viewport)))) {
      store.set('focused', true);
      store.pauseTimers();
    }
  }
  function handleBlur(event: FocusEvent) {
    if (!focused || contains(store.state.viewport, event.relatedTarget as Element | null)) return;
    store.set('focused', false);
    resumeTimersIfWindowFocused();
  }

  const renderState = $derived({ expanded });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      const disposeHost = attach(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          disposeHost?.();
        });
    });
  }
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = props;
    return {
      ...mergeComponentProps(
        renderState,
        { class: className, style },
        [
          {
            tabindex: -1,
            role: 'region',
            'aria-live': 'polite',
            'aria-atomic': false,
            'aria-relevant': 'additions text',
            'aria-label': 'Notifications',
            'data-expanded': expanded ? '' : undefined,
            onmouseenter: handleMouseEnter,
            onmousemove: handleMouseEnter,
            onmouseleave: handleMouseLeave,
            onfocusin: handleFocus,
            onfocusout: handleBlur,
            onkeydown: handleKeyDown,
            onclick: handleFocus,
            onpointerdown: handlePointerDown,
            onpointerup: handlePointerEnd,
            onpointercancel: handlePointerEnd,
            style: {
              '--toast-frontmost-height': toasts[0]?.height ? `${toasts[0].height}px` : undefined,
            },
          },
          attributes,
        ],
        false,
      ),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#snippet guard()}
  {#if !isEmpty && prevFocusElement}
    <FocusGuard onfocus={handleFocusGuard} />
  {/if}
{/snippet}
{@render guard()}
{#snippet hostChildren()}
  {@render guard()}
  {@render children?.()}
  {@render guard()}
{/snippet}
{#if render}
  {@render render(mergedProps, renderState, hostChildren)}
{:else}
  <div {...mergedProps}>{@render hostChildren?.()}</div>
{/if}
{#if !focused && highPriorityToasts.length > 0}
  <div style={hiddenStyle}>
    {#each highPriorityToasts as toast (toast.id)}
      <div role="alert" aria-atomic="true">
        <div>
          {#if typeof toast.title === 'function'}{@render toast.title()}{:else if typeof toast.title !== 'boolean'}{toast.title ??
              ''}{/if}
        </div>
        <div>
          {#if typeof toast.description === 'function'}{@render toast.description()}{:else if typeof toast.description !== 'boolean'}{toast.description ??
              ''}{/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
