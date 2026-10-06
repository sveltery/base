<script lang="ts">
  import { untrack } from 'svelte';
  // Source SliderTrack.tsx at Base UI 47b40521; MIT.
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useSliderRootContext } from '../root/SliderRootContext.js';
  import { sliderStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import type { SliderTrackProps } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: SliderTrackProps = $props();
  const context = useSliderRootContext();

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
      context.state,
      { class: classProp, style },
      [{ style: { position: 'relative' } }, elementProps],
      sliderStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, context.state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
