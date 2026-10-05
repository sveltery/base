<script lang="ts">
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Source business port of Base UI v1.8.0 CheckboxIndicator.tsx. MIT.
  import { useCheckboxRootContext } from '../root/CheckboxRootContext.js';
  import { getCheckboxStateAttributesMapping } from '../utils/getCheckboxStateAttributesMapping.js';
  import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete.svelte.js';
  import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
  import { transitionStatusMapping } from '../../internals/stateAttributesMapping.js';
  import type {
    CheckboxIndicatorProps,
    CheckboxIndicatorState,
  } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    keepMounted = false,
    children,
    ref = $bindable(),
    ...elementProps
  }: CheckboxIndicatorProps = $props();
  const getRootState = useCheckboxRootContext();
  const rootState = $derived(getRootState());
  const rendered = $derived(rootState.checked || rootState.indeterminate);
  const transition = useTransitionStatus(() => rendered);
  const indicatorRef = $state<{ current: HTMLSpanElement | null }>({
    current: null,
  });
  const indicatorState: CheckboxIndicatorState = $derived({
    ...rootState,
    transitionStatus: transition.transitionStatus,
  });
  useOpenChangeComplete({
    batch: true,
    get enabled() {
      return !rendered;
    },
    get open() {
      return rendered;
    },
    ref: indicatorRef,
    onComplete() {
      if (!rendered) transition.setMounted(false);
    },
  });
  const stateAttributesMapping = $derived({
    ...getCheckboxStateAttributesMapping(rootState),
    ...transitionStatusMapping,
  });
  const shouldRender = $derived(keepMounted || transition.mounted);

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
  const mergedProps = $derived({
    ...mergeComponentProps(
      indicatorState,
      { class: classProp, style: style },
      elementProps,
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if shouldRender}{#if render}
    {@render render(mergedProps, indicatorState, children)}
  {:else}
    <span {...mergedProps}>{@render children?.()}</span>
  {/if}{/if}
