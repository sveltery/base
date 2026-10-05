<script lang="ts">
  // Original MenuViewport captured DOM/current-key composition, native keyed markup (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { createRefAttachment } from '../internals/nativeRefAttachment.js';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { popupViewportStateMapping, usePopupViewport } from '../utils/usePopupViewport.svelte.js';
  import * as CommonPopupCssVars from '../utils/CommonPopupCssVars.js';
  import { toNativeStyle } from '../internals/nativeProps.js';
  import type { MenuViewportProps } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuViewportProps = $props();
  const { store } = useMenuRootContext();
  const positioner = useMenuPositionerContext();
  const viewport = usePopupViewport(() => ({ store, side: positioner.side, children }));
  const componentState = $derived({
    activationDirection: viewport.state.activationDirection,
    transitioning: viewport.state.transitioning,
    instant: store.useState('instantType'),
  });
  const currentAttachment = createRefAttachment<HTMLDivElement>(() => {});
  const previousAttachment = createRefAttachment<HTMLDivElement>(() => {});
  const attachmentKey = createAttachmentKey();
  const currentProps = $derived({
    [attachmentKey]: currentAttachment(viewport.setCurrentContainer),
  });
  const previousProps = $derived({
    [attachmentKey]: previousAttachment(viewport.setPreviousContainer),
  });
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{
    state: componentState,
    props: [elementProps],
    stateAttributesMapping: popupViewportStateMapping,
  }}
  bind:element={ref}
>
  {#if viewport.previousContentNode}
    <div
      data-previous
      inert
      {...previousProps}
      style={toNativeStyle({
        ...(viewport.previousContentDimensions
          ? {
              [CommonPopupCssVars.popupWidth]: `${viewport.previousContentDimensions.width}px`,
              [CommonPopupCssVars.popupHeight]: `${viewport.previousContentDimensions.height}px`,
            }
          : null),
        position: 'absolute',
      })}
      data-ending-style={viewport.showStartingStyleAttribute ? undefined : ''}
    ></div>
  {/if}
  {#key viewport.currentContentKey}
    <div
      data-current
      {...currentProps}
      data-starting-style={viewport.previousContentNode && viewport.showStartingStyleAttribute
        ? ''
        : undefined}>{@render children?.()}</div
    >
  {/key}
</RenderElement>
