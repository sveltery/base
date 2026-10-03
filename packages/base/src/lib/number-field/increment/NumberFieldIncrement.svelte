<script lang="ts">
  // Base UI v1.8.0 NumberFieldIncrement delegates to the shared stepper (MIT).
  import StepperButton from '../root/StepperButton.svelte';
  import type { NumberFieldIncrementProps } from '../types.js';
  let { ref = $bindable(), ...props }: NumberFieldIncrementProps = $props();
</script>
<StepperButton {...props} isIncrement={true} bind:ref />
