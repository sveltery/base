<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { untrack } from 'svelte';

  // Original MenuViewport captured DOM/current-key composition, native keyed markup (MIT).
  import { createAttachmentKey } from 'svelte/attachments';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import {
    popupViewportStateMapping,
    usePopupViewport,
  } from '../utils/usePopupViewport.svelte.js';
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
  const viewport = usePopupViewport(() => ({
    store,
    side: positioner.side,
    children,
  }));
  const componentState = $derived({
    activationDirection: viewport.state.activationDirection,
    transitioning: viewport.state.transitioning,
    instant: store.useState('instantType'),
  });
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
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      componentState,
      { class: className, style: style },
      [elementProps],
      popupViewportStateMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet hostChildren()}
  {#if viewport.previousContentNode}
    <div
      data-previous
      inert
      {@attach attachPrevious}
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
      {@attach attachCurrent}
      data-starting-style={viewport.previousContentNode &&
      viewport.showStartingStyleAttribute
        ? ''
        : undefined}
    >
      {@render children?.()}
    </div>
  {/key}
{/snippet}
{#if render}
  {@render render(mergedProps, componentState, hostChildren)}
{:else}
  <div {...mergedProps}>{@render hostChildren?.()}</div>
{/if}
