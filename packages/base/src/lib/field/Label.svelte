<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Ported from Base UI v1.8.0 FieldLabel.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import { DEV } from 'esm-env';
  import { error } from '@sveltery/utils/error';

  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { useLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
  import { useLabel } from '../internals/labelable-provider/useLabel.svelte.js';
  import { useFieldItemContext } from './item/FieldItemContext.js';
  import type { FieldLabelProps } from './types.js';
  let { children, render, class: classProp, style, id: idProp, nativeLabel = true, ref = $bindable(), ...elementProps }: FieldLabelProps = $props();
  const fieldRootContext = useFieldRootContext(false);
  const fieldItemContext = useFieldItemContext();
  const labelable = useLabelableContext();
  const labelState = $derived({ ...fieldRootContext.state, disabled: fieldRootContext.disabled || fieldItemContext.disabled });
  const labelRef = $state<{ current: HTMLElement | null }>({ current: null });
  const nativeId = $props.id();
  const getLabelProps = useLabel(() => ({ id: labelable.labelId ?? idProp ?? undefined, native: nativeLabel }), nativeId);
  // Native post-DOM lifecycle replaces React.useEffect and its optional owner-stack API.
  $effect(() => {
    if (!DEV || !labelRef.current) return;
    const isLabelTag = labelRef.current.tagName === 'LABEL';
    if (nativeLabel) {
      if (!isLabelTag) error('<Field.Label> expected a <label> element because the `nativeLabel` prop is true. ' +
        'Rendering a non-<label> disables native label association, so `htmlFor` will not ' +
        'work. Use a real <label> in the `render` prop, or set `nativeLabel` to `false`.');
    } else if (isLabelTag) error('<Field.Label> expected a non-<label> element because the `nativeLabel` prop is false. ' +
      'Rendering a <label> assumes native label behavior while Base UI treats it as ' +
      'non-native, which can cause unexpected pointer behavior. Use a non-<label> in the ' +
      '`render` prop, or set `nativeLabel` to `true`.');
  });
  
  
  

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    labelRef.current = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
      if (labelRef.current === host) labelRef.current = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(labelState, { class: classProp, style: style }, [getLabelProps(), elementProps], fieldValidityMapping), [hostAttachmentKey]: attachHost });
</script>
{#if render}
  {@render render(mergedProps, labelState, children)}
{:else}
  <label {...mergedProps}>{@render children?.()}</label>
{/if}
