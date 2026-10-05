<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Adapted from pinned MeterLabel; MIT: THIRD_PARTY_NOTICES.md.
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getMeterContext } from './context.js';
  import { emptyState } from './helpers.js';
  import type { MeterLabelProps } from './types.js';
  let { children, id: idProp, render, class: classProp, ref = $bindable(), ...props }: MeterLabelProps = $props();
  const context = getMeterContext();
  const state = emptyState;
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const id = $derived(idProp ?? generatedId);
  $effect(() => {
    const registered = id;
    context.setLabelId(registered);
    return () => context.setLabelId(current => current === registered ? undefined : current);
  });
  const internal = $derived({ id, role: 'presentation' });
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp) });

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived.by(() => {
  const { class: className, style, ...attributes } = resolved;
  return { ...mergeComponentProps(state, { class: className, style }, [internal, attributes], false), [hostAttachmentKey]: attachHost };
});
</script>
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <span {...mergedProps}>{@render children?.()}</span>
{/if}
