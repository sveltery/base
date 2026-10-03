<script lang="ts">
  // Base UI v1.8.0 RadioIndicator.tsx source composition; MIT.
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useRadioRootContext } from '../root/RadioRootContext.js';
  import { stateAttributesMapping } from '../stateAttributesMapping.js';
  import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete.svelte.js';
  import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
  import type { RadioIndicatorProps, RadioIndicatorState } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    keepMounted = false,
    children,
    ref = $bindable(),
    ...elementProps
  }: RadioIndicatorProps = $props();
  const getRootState = useRadioRootContext();
  const rendered = $derived(getRootState().checked);
  const transition = useTransitionStatus(() => rendered);
  const indicatorState: RadioIndicatorState = $derived({
    ...getRootState(),
    transitionStatus: transition.transitionStatus,
  });
  const indicatorRef = $state<{ current: HTMLElement | null }>({ current: null });
  const shouldRender = $derived(keepMounted || transition.mounted);
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
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    ref: [forwardedRef, indicatorRef],
    state: indicatorState,
    props: elementProps,
    stateAttributesMapping,
  });
</script>
{#if shouldRender}<RenderElement tag="span" {componentProps} {params} {children} />{/if}
