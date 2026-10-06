<script lang="ts">
  import { untrack } from 'svelte';
  // Source SliderIndicator.tsx at Base UI 47b40521; MIT.
  import { valueToPercent } from '../../utils/valueToPercent.js';
  import { HydrationState } from '../../utils/useIsHydrating.svelte.js';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useSliderRootContext } from '../root/SliderRootContext.js';
  import { sliderStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import type { SliderIndicatorProps } from '../types.js';
  function getIndicatorStyles(
    vertical: boolean,
    range: boolean,
    inset: boolean,
    start: number | undefined,
    end: number | undefined,
    forceHidden: boolean,
  ): Record<string, string | number | undefined> {
    const styles: Record<string, string | number | undefined> = {
      visibility:
        forceHidden || (inset && (start === undefined || (range && end === undefined)))
          ? 'hidden'
          : undefined,
      position: vertical ? 'absolute' : 'relative',
      [vertical ? 'width' : 'height']: 'inherit',
    };
    let startValue = `${start ?? 0}%`;
    let sizeValue = `${(end ?? 0) - (start ?? 0)}%`;
    if (inset) {
      styles['--start-position'] = startValue;
      startValue = 'var(--start-position)';
      if (range) {
        styles['--relative-size'] = sizeValue;
        sizeValue = 'var(--relative-size)';
      }
    }
    styles[vertical ? 'bottom' : 'insetInlineStart'] = range ? startValue : 0;
    styles[vertical ? 'height' : 'width'] = range ? sizeValue : startValue;
    return styles;
  }
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: SliderIndicatorProps = $props();
  const context = useSliderRootContext();
  const isHydrating = new HydrationState().read;
  const vertical = $derived(context.orientation === 'vertical');
  const range = $derived(context.values.length > 1);
  const indicatorStyle = $derived(
    getIndicatorStyles(
      vertical,
      range,
      context.inset,
      context.inset
        ? context.indicatorPosition[0]
        : valueToPercent(context.values[0], context.min, context.max),
      context.inset
        ? context.indicatorPosition[1]
        : valueToPercent(context.values[context.values.length - 1], context.min, context.max),
      context.inset && context.renderBeforeHydration && isHydrating(),
    ),
  );

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
      [
        {
          'data-base-ui-slider-indicator': context.renderBeforeHydration ? '' : undefined,
          style: indicatorStyle,
        },
        elementProps,
      ],
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
