<script lang="ts">
  import { flushSync, untrack } from 'svelte';
  import { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
  import { useClick, type UseClickProps } from '../../src/lib/floating-ui/hooks/useClick.svelte.js';
  import { createChangeEventDetails } from '../../src/lib/internals/createBaseUIEventDetails.js';
  import { mergeProps } from '../../src/lib/merge-props/index.js';
  let {
    options = {},
    initialOpen = false,
    typeable = false,
    cancel = false,
    beforeClick,
  }: {
    options?: UseClickProps;
    initialOpen?: boolean;
    typeable?: boolean;
    cancel?: boolean;
    beforeClick?: () => void;
  } = $props();
  let selectedOptions = $state.raw<UseClickProps>(untrack(() => options));
  let reference = $state<HTMLElement | null>(null);
  let floating = $state<HTMLDivElement | null>(null);
  const changes: { owner: string; open: boolean; reason: string; trigger?: Element | undefined }[] =
    [];
  function makeStore(owner: string, initial: boolean) {
    const owned = new FloatingRootStore({
      open: initial,
      transitionStatus: undefined,
      referenceElement: null,
      floatingElement: null,
      triggerElements: new PopupTriggerMap(),
      floatingId: `click-fixture-${owner}`,
      syncOnly: false,
      nested: false,
      onOpenChange(open, details) {
        changes.push({ owner, open, reason: details.reason, trigger: details.trigger });
        if (cancel) details.cancel();
        if (!details.isCanceled) owned.update({ open });
      },
    });
    return owned;
  }
  const firstStore = untrack(() => makeStore('first', initialOpen));
  const secondStore = untrack(() => makeStore('second', false));
  let store = $state.raw(firstStore);
  const open = $derived(store.useState('open'));
  $effect.pre(() => {
    store.update({
      referenceElement: reference,
      domReferenceElement: reference,
      floatingElement: floating,
    });
  });
  const click = useClick(
    () => store,
    () => selectedOptions,
  );
  const referenceProps = $derived(
    mergeProps(click.reference, {
      onclick() {
        flushSync(() => beforeClick?.());
      },
    }),
  );
  export function snapshot() {
    return changes;
  }
  export function setOptions(next: UseClickProps) {
    selectedOptions = next;
  }
  export function setOpen(next: boolean) {
    store.update({ open: next });
  }
  export function selectSecondStore() {
    store = secondStore;
  }
  export function requestHoverOpen(event: MouseEvent) {
    store.setOpen(true, createChangeEventDetails('trigger-hover', event, reference ?? undefined));
  }
</script>

<svelte:element
  this={typeable ? 'input' : 'button'}
  {...referenceProps}
  bind:this={reference}
  data-testid="reference"
/>
{#if open}<div role="tooltip" bind:this={floating}></div>{/if}
