<script lang="ts">
  import { untrack } from 'svelte';
  // Shared source NumberField stepper composition, native Svelte renderer (MIT).
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useNumberFieldStepperButton } from './useNumberFieldStepperButton.svelte.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import type { NumberFieldIncrementProps } from '../types.js';
  let {
    isIncrement,
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    disabled = false,
    nativeButton = true,
    ...elementProps
  }: NumberFieldIncrementProps & { isIncrement: boolean } = $props();
  const button = useNumberFieldStepperButton(() => ({ isIncrement, disabled, nativeButton }));
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      button.buttonRef?.(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (button.element === host) button.buttonRef?.(null);
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      button.state,
      { class: classProp, style },
      [button.props, elementProps, button.getButtonProps],
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, button.state, children)}
{:else}
  <button type="button" {...mergedProps}>{@render children?.()}</button>
{/if}
