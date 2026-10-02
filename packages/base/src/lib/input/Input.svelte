<script lang="ts">
  // Base UI v1.8.0 standalone Input/Field.Control adaptation; MIT: THIRD_PARTY_NOTICES.md.
  import { tick } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import type { InputProps } from './types.js';
  import type { HTMLInputAttributes } from 'svelte/elements';
  let { children, render, disabled = false, id, value, defaultValue, onValueChange, ref = $bindable(), ...props }: InputProps = $props();
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const state = $derived({ disabled, touched: false, dirty: false, filled: false, focused: false, valid: null });
  function attach(node: HTMLElement) {
    // Native Svelte does not restore a rejected controlled edit. Synchronize the external
    // DOM after the owner has processed its callback, without manufacturing reset defaults.
    let connected = true;
    const restoreControlledEdit = () => {
      void tick().then(() => {
        if (!connected || value === undefined) return;
        const input = node as HTMLInputElement;
        const next = value == null ? '' : String(value);
        if (input.value !== next) input.value = next;
      });
    };
    node.addEventListener('input', restoreControlledEdit);
    return () => { connected = false; node.removeEventListener('input', restoreControlledEdit); };
  }
  const internal = $derived({
    id: id ?? generatedId, disabled, 'data-disabled': disabled ? '' : undefined,
    // Preserve native value/defaultValue setters, including both getters in remote .as spreads.
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(value !== undefined ? { value } : {}),
    oninput(event: Event) {
      const next = (event.currentTarget as HTMLInputElement).value;
      onValueChange?.(next, createChangeEventDetails('none', event));
      // Standalone Field context setters and validation callbacks are no-ops. In particular,
      // cancel() does not roll back an uncontrolled native edit or native preventDefault().
    },
  });
</script>
{#snippet nativeInput(nativeProps: Record<string | symbol, unknown>)}
  <input {...nativeProps as HTMLInputAttributes} />
{/snippet}
<Element tag="input" {internal} {props} {state} render={render ?? nativeInput} {children} {attach} bind:ref />
