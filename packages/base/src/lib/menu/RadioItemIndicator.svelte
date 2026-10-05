<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original MenuRadioItemIndicator transition/presence composition (MIT).
  import { useMenuRadioItemContext } from './radio-item/MenuRadioItemContext.js';
  import { itemMapping } from './utils/stateAttributesMapping.js';
  import { useTransitionStatus } from '../internals/useTransitionStatus.svelte.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import type { MenuRadioItemIndicatorProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let {
    render,
    class: className,
    style,
    keepMounted = false,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuRadioItemIndicatorProps = $props();
  const item = useMenuRadioItemContext();
  const indicatorRef = { current: null as HTMLElement | null };
  const transition = useTransitionStatus(() => item.checked);
  useOpenChangeComplete({
    batch: true,
    get enabled() {
      return !item.checked;
    },
    get open() {
      return item.checked;
    },
    ref: indicatorRef,
    onComplete() {
      if (!item.checked) transition.setMounted(false);
    },
  });
  const componentState = $derived({
    checked: item.checked,
    disabled: item.disabled,
    highlighted: item.highlighted,
    transitionStatus: transition.transitionStatus,
  });
  const setRef = (node: HTMLElement | null) => {
    ref = node;
  };

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      indicatorRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (indicatorRef.current === host) indicatorRef.current = null;
        });
    });
  }
  const renderEnabled = $derived(keepMounted || transition.mounted);
  const mergedProps = $derived({
    ...mergeComponentProps(
      componentState,
      { class: className, style: style },
      { 'aria-hidden': true, ...elementProps },
      itemMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if renderEnabled}
  {#if render}
    {@render render(mergedProps, componentState, children)}
  {:else}
    <span {...mergedProps}>{@render children?.()}</span>
  {/if}
{/if}
