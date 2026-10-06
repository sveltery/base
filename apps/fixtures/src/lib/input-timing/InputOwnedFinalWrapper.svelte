<script lang="ts">
  // Base UI v1.8.0 standalone Input/Field.Control adaptation; MIT: THIRD_PARTY_NOTICES.md.
  import { tick, untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { mergeComponentProps } from '../../../../../packages/base/src/lib/internals/mergeComponentProps.js';
  import { createChangeEventDetails } from '../../../../../packages/base/src/lib/internals/createBaseUIEventDetails.js';
  import type { InputProps } from '@sveltery/base/input';
  import type { HTMLProps } from '../../../../../packages/base/src/lib/internals/types.js';
  let {
    children,
    render,
    class: classProp,
    style,
    disabled = false,
    id,
    value,
    defaultValue,
    onValueChange,
    ref = $bindable(),
    ...props
  }: InputProps = $props();
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const state = $derived({
    disabled,
    touched: false,
    dirty: false,
    filled: false,
    focused: false,
    valid: null,
  });
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
    return () => {
      connected = false;
      node.removeEventListener('input', restoreControlledEdit);
    };
  }
  const internal = $derived({
    id: id ?? generatedId,
    disabled,
    'data-disabled': disabled ? '' : undefined,
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
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      const dispose = attach(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          dispose();
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(state, { class: classProp, style }, [internal, props], false),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet nativeInput(nativeProps: HTMLProps)}
  <input
    {...nativeProps}
    oninput={(event) => {
      // Fixture-only change: restore from this component's own controlled prop getter.
      // This authored native host keeps the existing ordered prop and handler composition.
      const input = event.currentTarget;
      try {
        (nativeProps.oninput as ((event: Event) => void) | undefined)?.(event);
      } finally {
        if (value !== undefined) {
          const next = value == null ? '' : String(value);
          if (input.value !== next) input.value = next;
        }
      }
    }}
  />
{/snippet}
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  {@render nativeInput(mergedProps)}
{/if}
