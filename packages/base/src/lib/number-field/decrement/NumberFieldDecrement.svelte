<script lang="ts">
  // Base UI v1.8.0 NumberFieldDecrement delegates to the shared stepper (MIT).
  import StepperButton from '../root/StepperButton.svelte';
  import type { NumberFieldDecrementProps } from '../types.js';
  let { ref = $bindable(), ...props }: NumberFieldDecrementProps = $props();
</script>

<StepperButton {...props} isIncrement={false} bind:ref />
