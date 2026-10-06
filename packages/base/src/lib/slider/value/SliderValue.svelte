<script lang="ts">
  import { untrack } from 'svelte';
  // Source SliderValue.tsx at Base UI 47b40521; MIT.
  import { formatNumber } from '@sveltery/utils/formatNumber';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useSliderRootContext } from '../root/SliderRootContext.js';
  import { sliderStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import type { SliderValueProps } from '../types.js';
  let {
    'aria-live': ariaLive = 'off',
    render,
    class: classProp,
    children,
    style,
    ref = $bindable(),
    ...elementProps
  }: SliderValueProps = $props();
  const context = useSliderRootContext();
  const outputFor = $derived(
    Array.from(context.thumbMap.values(), ({ inputId }) => inputId)
      .join(' ')
      .trim() || undefined,
  );
  const formattedValues = $derived(
    context.values.map((value) => formatNumber(value, context.locale, context.format)),
  );
  const defaultDisplayValue = $derived(formattedValues.join(' – '));

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
      [{ 'aria-live': ariaLive, for: outputFor }, elementProps],
      sliderStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet display()}{#if children}{@render children(
      formattedValues,
      context.values,
    )}{:else}{defaultDisplayValue}{/if}{/snippet}
{#if render}
  {@render render(mergedProps, context.state, display)}
{:else}
  <output {...mergedProps}>{@render display()}</output>
{/if}
