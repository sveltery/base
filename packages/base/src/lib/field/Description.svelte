<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  import { untrack } from 'svelte';
  // Ported from Base UI v1.8.0 FieldDescription.tsx; MIT: THIRD_PARTY_NOTICES.md.

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
  $effect(() => {
    if (!id) return;
    const installedId = id;
    untrack(() => setMessageIds((v) => v.concat(installedId)));
    return () => {
      setMessageIds((v) => v.filter((item) => item !== installedId));
    };
  });

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
      descriptionState,
      { class: classProp, style: style },
      [{ id }, elementProps],
      fieldValidityMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, descriptionState, children)}
{:else}
  <p {...mergedProps}>{@render children?.()}</p>
{/if}
