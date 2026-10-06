<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Adapted from Base UI v1.8.0 CollapsibleRoot/useCollapsibleRoot/useTransitionStatus.
  // Immutable pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { setCollapsibleContext } from './context.js';
  import { stateAttributes } from './state.js';
  import type { CollapsibleRootProps, CollapsibleTransitionStatus } from './types.js';
  let {
    children,
    render,
    open: openProp,
    defaultOpen = false,
    disabled = false,
    onOpenChange,
    class: classProp,
    ref = $bindable(),
    ...props
  }: CollapsibleRootProps = $props();
  const openState = new Controlled(
    () => openProp,
    untrack(() => defaultOpen),
  );
  const open = $derived(openState.value);
  let retainedMounted = $state(untrack(() => open));
  let phase = $state<CollapsibleTransitionStatus>(untrack(() => (open ? 'idle' : undefined)));
  const mounted = $derived(open || retainedMounted);
  const transitionStatus = $derived(
    open && !retainedMounted
      ? 'starting'
      : !open && !mounted && phase === 'ending'
        ? undefined
        : phase,
  );
  const rootState = $derived({ open, disabled, transitionStatus });
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(rootState) : classProp;
    return {
      ...props,
      class: classValue === undefined ? undefined : resolveClassValue(classValue),
    };
  });
  const generatedId = $props.id();
  const defaultPanelId = `base-ui-${generatedId}`;
  let registeredPanelId = $state<string | null | undefined>(undefined);
  const panelId = $derived(
    registeredPanelId === null ? undefined : (registeredPanelId ?? defaultPanelId),
  );
  function setOpen(next: boolean) {
    openState.set(next);
  }
  const context = {
    get open() {
      return open;
    },
    get disabled() {
      return disabled;
    },
    get mounted() {
      return mounted;
    },
    get transitionStatus() {
      return transitionStatus;
    },
    get state() {
      return rootState;
    },
    get defaultPanelId() {
      return defaultPanelId;
    },
    get registeredPanelId() {
      return registeredPanelId;
    },
    get panelId() {
      return panelId;
    },
    setOpen,
    // The immutable helper clears only ending; no-motion close can retain idle.
    setMounted(next: boolean) {
      retainedMounted = next;
      if (!next && !open && phase === 'ending') phase = undefined;
    },
    onOpenChange(
      next: boolean,
      details: Parameters<NonNullable<CollapsibleRootProps['onOpenChange']>>[1],
    ) {
      onOpenChange?.(next, details);
    },
    handleTrigger(event: MouseEvent | KeyboardEvent) {
      const next = !open;
      const details = createChangeEventDetails('trigger-press', event);
      onOpenChange?.(next, details);
      if (!details.isCanceled) setOpen(next);
    },
    setPanelIdState(
      next:
        | string
        | null
        | undefined
        | ((current: string | null | undefined) => string | null | undefined),
    ) {
      registeredPanelId = typeof next === 'function' ? next(registeredPanelId) : next;
    },
  };
  setCollapsibleContext(context);
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

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = resolved;
    return {
      ...mergeComponentProps(
        rootState,
        { class: className, style },
        [stateAttributes(rootState), attributes],
        false,
      ),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if render}
  {@render render(mergedProps, rootState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
