<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { untrack } from 'svelte';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { createAttachmentKey } from 'svelte/attachments';
  import { usePreviewCardRootContext } from './context.js';
  import { usePreviewCardPositionerContext } from './positioner/PreviewCardPositionerContext.js';
  import { popupViewportStateMapping, usePopupViewport } from '../utils/usePopupViewport.svelte.js';
  import * as CommonPopupCssVars from '../utils/CommonPopupCssVars.js';
  import { toNativeStyle } from '../internals/nativeProps.js';
  import type { PreviewCardViewportProps, PreviewCardViewportState } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), ...elementProps }: PreviewCardViewportProps = $props();
  const store = usePreviewCardRootContext();
  const positioner = usePreviewCardPositionerContext();
  const viewport = usePopupViewport(() => ({ store, side: positioner.side, children }));
  const state: PreviewCardViewportState = $derived({ activationDirection: viewport.state.activationDirection, transitioning: viewport.state.transitioning, instant: store.select('instantType') });
  function attachCurrent(node: HTMLDivElement) {
    viewport.setCurrentContainer(node);
    return () => viewport.setCurrentContainer(null);
  }
  function attachPrevious(node: HTMLDivElement) {
    viewport.setPreviousContainer(node);
    return () => viewport.setPreviousContainer(null);
  }
  

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(state, { class: className, style: style }, [elementProps], popupViewportStateMapping), [hostAttachmentKey]: attachHost });
</script>
{#snippet hostChildren()}

  {#if viewport.previousContentNode}
    <div data-previous inert {@attach attachPrevious} style={toNativeStyle({ ...(viewport.previousContentDimensions ? { [CommonPopupCssVars.popupWidth]: `${viewport.previousContentDimensions.width}px`, [CommonPopupCssVars.popupHeight]: `${viewport.previousContentDimensions.height}px` } : null), position: 'absolute' })} data-ending-style={viewport.showStartingStyleAttribute ? undefined : ''}></div>
  {/if}
  {#key viewport.currentContentKey}
    <div data-current {@attach attachCurrent} data-starting-style={viewport.previousContentNode && viewport.showStartingStyleAttribute ? '' : undefined}>{@render children?.()}</div>
  {/key}

{/snippet}
{#if render}
  {@render render(mergedProps, state, hostChildren)}
{:else}
  <div {...mergedProps}>{@render hostChildren?.()}</div>
{/if}
