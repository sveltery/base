<script lang="ts">
  // Ported from Base UI v1.8.0 FieldsetLegend.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { useFieldsetRootContext } from './root/FieldsetRootContext.js';
  import { useRegisteredLabelId } from '../utils/useRegisteredLabelId.svelte.js';
  import type { FieldsetLegendProps } from './types.js';
  let {
    children,
    render,
    class: classProp,
    style,
    id: idProp,
    ref = $bindable(),
    ...elementProps
  }: FieldsetLegendProps = $props();
  const fieldset = useFieldsetRootContext();
  const nativeId = $props.id();
  const getId = useRegisteredLabelId(() => idProp ?? undefined, fieldset.setLegendId, nativeId);
  const legendState = $derived({ disabled: fieldset.disabled });
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state: legendState,
    ref: forwardedRef,
    props: [{ id: getId() }, elementProps],
  });
</script>

<RenderElement tag="div" {componentProps} {params} {children} />
