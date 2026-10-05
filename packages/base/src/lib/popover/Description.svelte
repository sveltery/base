<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { usePopoverRootContext } from './context.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import type { PopoverDescriptionProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), ...elementProps }: PopoverDescriptionProps = $props();
  const store = usePopoverRootContext();
  const generatedId = $props.id();
  const id = $derived(useBaseUiId(elementProps.id ?? undefined, generatedId));
  store.useSyncedValueWithCleanup('descriptionElementId', () => id);
  

const renderState = $derived({});
const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(renderState, { class: className, style: style }, [{ id }, elementProps], undefined), [hostAttachmentKey]: attachHost });
</script>
{#if render}
  {@render render(mergedProps, renderState, children)}
{:else}
  <p {...mergedProps}>{@render children?.()}</p>
{/if}
