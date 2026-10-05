<script lang="ts">
  // Ported from Base UI v1.8.0 FieldDescription.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { useLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useFieldItemContext } from './item/FieldItemContext.js';
  import type { FieldDescriptionProps } from './types.js';
  let {
    children,
    render,
    id: idProp,
    class: classProp,
    style,
    ref = $bindable(),
    ...elementProps
  }: FieldDescriptionProps = $props();
  const nativeId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, nativeId));
  const fieldRootContext = useFieldRootContext(false);
  const fieldItemContext = useFieldItemContext();
  const { setMessageIds } = useLabelableContext();
  const descriptionState = $derived({
    ...fieldRootContext.state,
    disabled: fieldRootContext.disabled || fieldItemContext.disabled,
  });
  useIsoLayoutEffect(
    () => {
      if (!id) return;
      const installedId = id;
      setMessageIds((v) => v.concat(installedId));
      return () => {
        setMessageIds((v) => v.filter((item) => item !== installedId));
      };
    },
    () => [id, setMessageIds],
  );
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
    ref: forwardedRef,
    state: descriptionState,
    props: [{ id }, elementProps],
    stateAttributesMapping: fieldValidityMapping,
  });
</script>

<RenderElement tag="p" {componentProps} {params} {children} />
