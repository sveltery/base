<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Original DialogDescription id registration/cleanup and shared renderer (MIT).
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useDialogRootContext } from './context.js';
  import type { DialogDescriptionProps } from './types.js';
  let { children, render, class: className, style, id: idProp, ref = $bindable(), ...elementProps }: DialogDescriptionProps = $props();
  const generatedId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const store = useDialogRootContext();
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
