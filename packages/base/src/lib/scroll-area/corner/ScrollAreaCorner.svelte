<script lang="ts">
import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Base UI1.8.0 ScrollAreaCorner.tsx source context/render composition; MIT.
  import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext.js';
  import type { ScrollAreaCornerProps } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ScrollAreaCornerProps = $props();
  const root = useScrollAreaRootContext();
  
  
  

const renderState = $derived({});
const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    root.cornerRef.current = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
      if (root.cornerRef.current === host) root.cornerRef.current = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(renderState, { class: classProp, style: style }, [
      {
        'aria-hidden': true,
        style: {
          position: 'absolute',
          bottom: 0,
          insetInlineEnd: 0,
          width: `${root.cornerSize.width}px`,
          height: `${root.cornerSize.height}px`,
        },
      },
      elementProps,
    ], undefined), [hostAttachmentKey]: attachHost });
</script>
{#if !root.hiddenState.corner}{#if render}
  {@render render(mergedProps, renderState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}{/if}
