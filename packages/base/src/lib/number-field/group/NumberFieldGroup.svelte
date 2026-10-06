<script lang="ts">
  import { untrack } from 'svelte';
  // Base UI v1.8.0 NumberFieldGroup.tsx business composition (MIT).
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useNumberFieldRootContext } from '../root/NumberFieldRootContext.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import type { NumberFieldGroupProps } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: NumberFieldGroupProps = $props();
  const context = useNumberFieldRootContext();
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
      [{ role: 'group' }, elementProps],
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, context.state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
