<script lang="ts">
  // Shared source NumberField stepper composition, native Svelte renderer (MIT).
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useNumberFieldStepperButton } from './useNumberFieldStepperButton.svelte.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import type { NumberFieldIncrementProps } from '../types.js';
  let { isIncrement, render, class: classProp, style, children, ref = $bindable(), disabled = false, nativeButton = true, ...elementProps }: NumberFieldIncrementProps & { isIncrement: boolean } = $props();
  const button = useNumberFieldStepperButton(() => ({ isIncrement, disabled, nativeButton }));
</script>
<RenderElement tag="button" componentProps={{ render, class: classProp, style }} params={{ ref: [button.buttonRef], state: button.state, props: [button.props, elementProps, button.getButtonProps], stateAttributesMapping }} bind:element={ref}>{@render children?.()}</RenderElement>
