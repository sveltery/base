<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Ported from Base UI v1.8.0 FieldsetLegend.tsx; MIT: THIRD_PARTY_NOTICES.md.
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
  const getId = useRegisteredLabelId(
    () => idProp ?? undefined,
    fieldset.setLegendId,
    nativeId,
  );
  const legendState = $derived({ disabled: fieldset.disabled });

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
      legendState,
      { class: classProp, style: style },
      [{ id: getId() }, elementProps],
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, legendState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
