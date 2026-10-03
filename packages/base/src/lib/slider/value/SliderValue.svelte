<script lang="ts">
  // Source SliderValue.tsx at Base UI 47b40521; MIT.
  import { formatNumber } from '../../utils/formatNumber.js';
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useSliderRootContext } from '../root/SliderRootContext.js';
  import { sliderStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import type { SliderValueProps } from '../types.js';
  let { 'aria-live': ariaLive = 'off', render, class: classProp, children, style, ref = $bindable(), ...elementProps }: SliderValueProps = $props();
  const context = useSliderRootContext();
  const outputFor = $derived(Array.from(context.thumbMap.values(), ({ inputId }) => inputId).join(' ').trim() || undefined);
  const formattedValues = $derived(context.values.map(value => formatNumber(value, context.locale, context.format)));
  const defaultDisplayValue = $derived(formattedValues.join(' – '));
  const forwardedRef = { get current() { return ref ?? null; }, set current(value: HTMLElement | null) { ref = value; } };
  const params = $derived({ state: context.state, ref: forwardedRef, props: [{ 'aria-live': ariaLive, for: outputFor }, elementProps], stateAttributesMapping: sliderStateAttributesMapping });
</script>
{#snippet display()}{#if children}{@render children(formattedValues, context.values)}{:else}{defaultDisplayValue}{/if}{/snippet}
<RenderElement tag="output" componentProps={{ render, class: classProp, style }} {params} children={display} />
