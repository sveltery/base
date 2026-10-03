<script lang="ts">
  // Source SliderIndicator.tsx at Base UI 47b40521; MIT.
  import { valueToPercent } from "../../utils/valueToPercent.js";
  import { useIsHydrating } from "../../utils/useIsHydrating.svelte.js";
  import RenderElement from "../../internals/RenderElement.svelte";
  import { useSliderRootContext } from "../root/SliderRootContext.js";
  import { sliderStateAttributesMapping } from "../root/stateAttributesMapping.js";
  import type { SliderIndicatorProps } from "../types.js";
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
        forceHidden ||
        (inset && (start === undefined || (range && end === undefined)))
          ? "hidden"
          : undefined,
      position: vertical ? "absolute" : "relative",
      [vertical ? "width" : "height"]: "inherit",
    };
    let startValue = `${start ?? 0}%`;
    let sizeValue = `${(end ?? 0) - (start ?? 0)}%`;
    if (inset) {
      styles["--start-position"] = startValue;
      startValue = "var(--start-position)";
      if (range) {
        styles["--relative-size"] = sizeValue;
        sizeValue = "var(--relative-size)";
      }
    }
    styles[vertical ? "bottom" : "insetInlineStart"] = range ? startValue : 0;
    styles[vertical ? "height" : "width"] = range ? sizeValue : startValue;
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
  const isHydrating = useIsHydrating();
  const vertical = $derived(context.orientation === "vertical");
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
        : valueToPercent(
            context.values[context.values.length - 1],
            context.min,
            context.max,
          ),
      context.inset && context.renderBeforeHydration && isHydrating(),
    ),
  );
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const params = $derived({
    state: context.state,
    ref: forwardedRef,
    props: [
      {
        "data-base-ui-slider-indicator": context.renderBeforeHydration
          ? ""
          : undefined,
        style: indicatorStyle,
      },
      elementProps,
    ],
    stateAttributesMapping: sliderStateAttributesMapping,
  });
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: classProp, style }}
  {params}
  {children}
/>
