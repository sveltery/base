<script lang="ts">
  // Base UI v1.8.0 Button behavior adaptation; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { getButtonProps } from './props.js';
  import type { ButtonProps } from './types.js';
  let { children, render, disabled = false, focusableWhenDisabled = false, nativeButton = true, ref = $bindable(), ...props }: ButtonProps = $props();
  const state = $derived({ disabled });
  const resolved = $derived(getButtonProps(props, disabled, focusableWhenDisabled, nativeButton));
</script>
<Element tag="button" props={resolved} {state} {render} {children} bind:ref />
