<script lang="ts">
  // Source SliderLabel.tsx at Base UI 47b40521; MIT.
  import { isHTMLElement } from "@floating-ui/utils/dom";
  import { ownerDocument } from "../../utils/owner.js";
  import {
    focusElementWithVisible,
    useLabel,
  } from "../../internals/labelable-provider/useLabel.svelte.js";
  import RenderElement from "../../internals/RenderElement.svelte";
  import { useSliderRootContext } from "../root/SliderRootContext.js";
  import { sliderStateAttributesMapping } from "../root/stateAttributesMapping.js";
  import type { SliderLabelProps } from "../types.js";
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: SliderLabelProps = $props();
  const context = useSliderRootContext();
  const elementPropsWithoutId = $derived.by(() => {
    const props = { ...elementProps } as typeof elementProps & {
      id?: string | undefined;
    };
    delete props.id;
    return props;
  });
  function focusControl(
    event: MouseEvent,
    controlId: string | null | undefined,
  ) {
    if (controlId) {
      const controlElement = ownerDocument(
        event.currentTarget as Element,
      ).getElementById(controlId);
      if (isHTMLElement(controlElement)) {
        focusElementWithVisible(controlElement);
        return;
      }
    }
    const fallbackInputs = context.controlRef.current?.querySelectorAll(
      'input[type="range"]',
    );
    const fallbackInput =
      fallbackInputs?.length === 1 ? fallbackInputs[0] : null;
    if (isHTMLElement(fallbackInput)) focusElementWithVisible(fallbackInput);
  }
  const nativeId = $props.id();
  const labelProps = useLabel(
    () => ({
      id: context.rootLabelId,
      setLabelId: context.setLabelId,
      focusControl,
    }),
    nativeId,
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
    props: [labelProps(), elementPropsWithoutId],
    stateAttributesMapping: sliderStateAttributesMapping,
  });
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: classProp, style }}
  {params}
  {children}
/>
