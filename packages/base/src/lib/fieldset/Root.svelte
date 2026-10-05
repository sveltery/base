<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Ported from Base UI v1.8.0 FieldsetRoot.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import { setFieldsetRootContext, useFieldsetRootContext } from './root/FieldsetRootContext.js';
  import type { FieldsetRootProps } from './types.js';
  let { children, render, class: classProp, style, disabled: disabledProp = false, ref = $bindable(), ...elementProps }: FieldsetRootProps = $props();
  let legendId = $state<string>();
  const parent = useFieldsetRootContext(true);
  const disabled = $derived(Boolean(parent?.disabled || disabledProp));
  const fieldsetState = $derived({ disabled });
  
  
  
  setFieldsetRootContext({
    get legendId() { return legendId; },
    setLegendId(value) { legendId = typeof value === 'function' ? value(legendId) : value; },
    get disabled() { return disabled; },
  });

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(fieldsetState, { class: classProp, style: style }, [{ 'aria-labelledby': legendId, disabled }, elementProps], undefined), [hostAttachmentKey]: attachHost });
</script>
{#if render}
  {@render render(mergedProps, fieldsetState, children)}
{:else}
  <fieldset {...mergedProps}>{@render children?.()}</fieldset>
{/if}
