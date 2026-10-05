<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Ported from Base UI v1.8.0 FieldItem.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import LabelableProvider from '../internals/labelable-provider/LabelableProvider.svelte';
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { setFieldItemContext } from './item/FieldItemContext.js';
  import type { FieldItemProps } from './types.js';
  let { children, render, class: classProp, style, disabled: disabledProp = false, ref = $bindable(), ...elementProps }: FieldItemProps = $props();
  const field = useFieldRootContext(false);
  const disabled = $derived(field.disabled || disabledProp);
  const itemState = $derived({ ...field.state, disabled });
  setFieldItemContext({ get disabled() { return disabled; } });
  
  
  

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(itemState, { class: classProp, style: style }, elementProps, fieldValidityMapping), [hostAttachmentKey]: attachHost });
</script>
<LabelableProvider>{#if render}
  {@render render(mergedProps, itemState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}</LabelableProvider>
