<script lang="ts">
  // Adapted from Base UI v1.8.0 CollapsibleRoot/useCollapsibleRoot/useTransitionStatus.
  // Immutable pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import { DEV } from 'esm-env';
  import { errorOnce } from './animations.js';
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { setCollapsibleContext } from './context.js';
  import { stateAttributes } from './state.js';
  import type { CollapsibleRootProps, CollapsibleTransitionStatus } from './types.js';
  let { children, render, open: openProp, defaultOpen = false, disabled = false,
    onOpenChange, class: classProp, ref = $bindable(), ...props }: CollapsibleRootProps = $props();
  const controlled = untrack(() => openProp !== undefined);
  const initialDefault = untrack(() => defaultOpen);
  let internalOpen = $state(initialDefault);
  // The immutable useControlled pin falls back to its initial default if a controlled value disappears.
  const open = $derived(controlled && openProp !== undefined ? openProp : internalOpen);
  let retainedMounted = $state(untrack(() => open));
  let phase = $state<CollapsibleTransitionStatus>(untrack(() => open ? 'idle' : undefined));
  const mounted = $derived(open || retainedMounted);
  const transitionStatus = $derived(open && !retainedMounted ? 'starting' : !open && !mounted && phase === 'ending' ? undefined : phase);
  const rootState = $derived({ open, disabled, transitionStatus });
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(rootState) : classProp;
    return { ...props, class: classValue === undefined ? undefined : resolveClassValue(classValue) };
  });
  const generatedId = $props.id();
  const defaultPanelId = `base-ui-${generatedId}`;
  let registeredPanelId = $state<string | null | undefined>(undefined);
  const panelId = $derived(registeredPanelId === null ? undefined : registeredPanelId ?? defaultPanelId);
  let committedOpen = untrack(() => open);
  let committedCallback = untrack(() => onOpenChange);
  function setOpen(next: boolean) { if (!controlled) internalOpen = next; }
  const context = {
    get open() { return open; }, get disabled() { return disabled; },
    get mounted() { return mounted; }, get transitionStatus() { return transitionStatus; },
    get state() { return rootState; }, get defaultPanelId() { return defaultPanelId; },
    get registeredPanelId() { return registeredPanelId; }, get panelId() { return panelId; },
    setOpen,
    // The immutable helper clears only ending; no-motion close can retain idle.
    setMounted(next: boolean) { retainedMounted = next; if (!next && !open && phase === 'ending') phase = undefined; },
    onOpenChange(next: boolean, details: Parameters<NonNullable<CollapsibleRootProps['onOpenChange']>>[1]) { committedCallback?.(next, details); },
    handleTrigger(event: MouseEvent | KeyboardEvent) {
      const next = !committedOpen;
      const details = createChangeEventDetails('trigger-press', event);
      committedCallback?.(next, details);
      if (!details.isCanceled) setOpen(next);
    },
    setPanelIdState(next: string | null | undefined | ((current: string | null | undefined) => string | null | undefined)) {
      registeredPanelId = typeof next === 'function' ? next(registeredPanelId) : next;
    },
  };
  setCollapsibleContext(context);
  $effect.pre(() => { committedOpen = open; committedCallback = onOpenChange; });
  // Each committed open/close cycle owns its frame. Close leaves one layout pass
  // for Panel to cache pixels before [data-ending-style] changes authored CSS.
  $effect.pre(() => {
    const nextOpen = open;
    const isMounted = mounted;
    const status = transitionStatus;
    if (nextOpen && !untrack(() => retainedMounted)) retainedMounted = true;
    if (nextOpen && status !== 'idle') phase = 'starting';
    if (!nextOpen && (!isMounted || status === 'ending')) return;
    const view = ref?.ownerDocument.defaultView ?? window;
    const frame = view.requestAnimationFrame(() => {
      if (nextOpen === open) phase = nextOpen ? 'idle' : 'ending';
    });
    return () => view.cancelAnimationFrame(frame);
  });
  $effect(() => {
    if (!DEV) return;
    if (controlled !== (openProp !== undefined)) {
      errorOnce(`A component is changing the ${controlled ? '' : 'un'}controlled open state of Collapsible to be ${controlled ? 'un' : ''}controlled.\nElements should not switch from uncontrolled to controlled (or vice versa).\nDecide between using a controlled or uncontrolled Collapsible element for the lifetime of the component.\nThe nature of the state is determined during the first render. It's considered controlled if the value is not \`undefined\`.\nMore info: https://fb.me/react-controlled-components`);
    }
  });
  $effect(() => {
    if (DEV && !controlled && defaultOpen !== initialDefault) errorOnce('A component is changing the default open state of an uncontrolled Collapsible after being initialized. To suppress this warning opt to use a controlled Collapsible.');
  });
</script>
<Element tag="div" internal={stateAttributes(rootState)} props={resolved} state={rootState} {render} {children} bind:ref />
