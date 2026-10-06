<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { usePreviewCardRootContext } from './context.js';
  import { usePreviewCardPositionerContext } from './positioner/PreviewCardPositionerContext.js';
  import { popupStateMapping } from '../utils/popupStateMapping.js';
  import type { PreviewCardArrowProps } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
    ref = $bindable(),
    ...elementProps
  }: PreviewCardArrowProps = $props();
  const store = usePreviewCardRootContext();
  const positioner = usePreviewCardPositionerContext();
  const state = $derived({
    open: store.select('open'),
    side: positioner.side,
    align: positioner.align,
    uncentered: positioner.arrowUncentered,
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      positioner.arrowRef.current = host;
      ref = host;
      return () =>
        untrack(() => {
          if (positioner.arrowRef.current === host) positioner.arrowRef.current = null;
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [{ style: positioner.arrowStyles, 'aria-hidden': true }, elementProps],
      popupStateMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
