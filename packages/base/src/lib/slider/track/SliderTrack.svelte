<script lang="ts">
  // Source SliderTrack.tsx at Base UI 47b40521; MIT.
  import RenderElement from "../../internals/RenderElement.svelte";
  import { useSliderRootContext } from "../root/SliderRootContext.js";
  import { sliderStateAttributesMapping } from "../root/stateAttributesMapping.js";
  import type { SliderTrackProps } from "../types.js";
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: SliderTrackProps = $props();
  const context = useSliderRootContext();
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
    props: [{ style: { position: "relative" } }, elementProps],
    stateAttributesMapping: sliderStateAttributesMapping,
  });
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: classProp, style }}
  {params}
  {children}
/>
