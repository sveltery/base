<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { usePreviewCardRootContext } from './context.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import type { PreviewCardBackdropProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), ...elementProps }: PreviewCardBackdropProps = $props();
  const store = usePreviewCardRootContext();
  const state = $derived({ open: store.select('open'), transitionStatus: store.select('transitionStatus') });
  

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(state, { class: className, style: style }, [{ role: 'presentation', hidden: !store.select('mounted'), style: { pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' } }, elementProps], popupTransitionStateMapping), [hostAttachmentKey]: attachHost });
</script>
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
