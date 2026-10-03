<script lang="ts">
  // Source business port of Base UI v1.8.0 CheckboxIndicator.tsx. MIT.
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useCheckboxRootContext } from '../root/CheckboxRootContext.js';
  import { getCheckboxStateAttributesMapping } from '../utils/getCheckboxStateAttributesMapping.js';
  import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete.svelte.js';
  import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
  import { transitionStatusMapping } from '../../internals/stateAttributesMapping.js';
  import type { CheckboxIndicatorProps, CheckboxIndicatorState } from '../types.js';
  let { render, class: classProp, style, keepMounted = false, children, ref = $bindable(), ...elementProps }: CheckboxIndicatorProps = $props();
  const getRootState = useCheckboxRootContext();
  const rootState = $derived(getRootState());
  const rendered = $derived(rootState.checked || rootState.indeterminate);
  const transition = useTransitionStatus(() => rendered);
  const indicatorRef = $state<{ current: HTMLSpanElement | null }>({ current: null });
  const indicatorState: CheckboxIndicatorState = $derived({ ...rootState, transitionStatus: transition.transitionStatus });
  useOpenChangeComplete({ batch: true, get enabled() { return !rendered; }, get open() { return rendered; }, ref: indicatorRef, onComplete() { if (!rendered) transition.setMounted(false); } });
  const stateAttributesMapping = $derived({ ...getCheckboxStateAttributesMapping(rootState), ...transitionStatusMapping });
  const shouldRender = $derived(keepMounted || transition.mounted);
  const forwardedRef = { get current() { return ref ?? null; }, set current(element: HTMLSpanElement | null) { ref = element; } };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ state: indicatorState, ref: [forwardedRef, indicatorRef], props: elementProps, stateAttributesMapping });
</script>
{#if shouldRender}<RenderElement tag="span" {componentProps} {params} {children} />{/if}
