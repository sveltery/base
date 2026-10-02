<script lang="ts">
  // Base UI v1.8.0 FieldLabel/useLabel; MIT: THIRD_PARTY_NOTICES.md.
  import { DEV } from 'esm-env';
  import Element from '../dialog/Element.svelte';
  import { resolveFieldProps } from './props.js';
  import { getFieldContext, getFieldItemContext } from './context.js';
  import { getLabelableContext } from './labelable.svelte.js';
  import { stateAttributes } from './state.js';
  import type { FieldLabelProps } from './types.js';
  let { children, render, id: idProp, nativeLabel = true, ref = $bindable(), ...props }: FieldLabelProps = $props();
  const field = getFieldContext(false)!;
  const item = getFieldItemContext();
  const labelable = getLabelableContext()!;
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const id = $derived(labelable.labelId ?? idProp ?? generatedId);
  const labelState = $derived({ ...field.state, disabled: field.state.disabled || Boolean(item?.disabled) });
  $effect(() => { const current = id; labelable.setLabelId(current); return () => labelable.removeLabelId(current); });
  function interact(event: MouseEvent) {
    const target = event.composedPath()[0] as HTMLElement | undefined;
    if (target?.closest?.('button,input,select,textarea')) return;
    if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
    if (nativeLabel || !labelable.controlId) return;
    const control = (event.currentTarget as HTMLElement).ownerDocument.getElementById(labelable.controlId);
    control?.focus({ focusVisible: true } as Parameters<HTMLElement['focus']>[0]);
  }
  function attach(node: HTMLElement) {
    $effect(() => {
      if (!DEV) return;
      if (nativeLabel && node.tagName !== 'LABEL') console.error('Base UI: <Field.Label> expected a <label> element because the `nativeLabel` prop is true. Rendering a non-<label> disables native label association, so `htmlFor` will not work. Use a real <label> in the `render` prop, or set `nativeLabel` to `false`.');
      else if (!nativeLabel && node.tagName === 'LABEL') console.error('Base UI: <Field.Label> expected a non-<label> element because the `nativeLabel` prop is false. Rendering a <label> assumes native label behavior while Base UI treats it as non-native, which can cause unexpected pointer behavior. Use a non-<label> in the `render` prop, or set `nativeLabel` to `true`.');
    });
  }
  const internal = $derived({
    ...stateAttributes(labelState), id,
    ...(nativeLabel ? { for: labelable.controlId ?? undefined, onmousedown: interact } : { onclick: interact, onpointerdown(event: PointerEvent) { event.preventDefault(); } }),
  });
</script>
<Element tag="label" {internal} props={resolveFieldProps(props, labelState)} state={labelState} {render} {children} {attach} bind:ref />
