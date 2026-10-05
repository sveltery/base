<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { createRefAttachment } from '../internals/nativeRefAttachment.js';
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
  const currentAttachment = createRefAttachment<HTMLDivElement>(() => {});
  const previousAttachment = createRefAttachment<HTMLDivElement>(() => {});
  const attachmentKey = createAttachmentKey();
  const currentProps = $derived({ [attachmentKey]: currentAttachment(viewport.setCurrentContainer) });
  const previousProps = $derived({ [attachmentKey]: previousAttachment(viewport.setPreviousContainer) });
  const forwardedRef = (node: HTMLElement | null) => { ref = node; };
</script>
<RenderElement tag="div" componentProps={{ render, class: className, style }} params={{ state, ref: forwardedRef, props: [elementProps], stateAttributesMapping: popupViewportStateMapping }}>
  {#if viewport.previousContentNode}
    <div data-previous inert {...previousProps} style={toNativeStyle({ ...(viewport.previousContentDimensions ? { [CommonPopupCssVars.popupWidth]: `${viewport.previousContentDimensions.width}px`, [CommonPopupCssVars.popupHeight]: `${viewport.previousContentDimensions.height}px` } : null), position: 'absolute' })} data-ending-style={viewport.showStartingStyleAttribute ? undefined : ''}></div>
  {/if}
  {#key viewport.currentContentKey}
    <div data-current {...currentProps} data-starting-style={viewport.previousContentNode && viewport.showStartingStyleAttribute ? '' : undefined}>{@render children?.()}</div>
  {/key}
</RenderElement>
