<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original MenuGroupLabel ID/conditional-cleanup/render body (MIT).

  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useMenuGroupRootContext } from './group/MenuGroupContext.js';
  import type { MenuGroupLabelProps } from './types.js';
  let {
    render,
    class: className,
    style,
    id: idProp,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuGroupLabelProps = $props();
  const generatedId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const setLabelId = useMenuGroupRootContext();
  $effect(() => {
    setLabelId(id);
    return () => {
      setLabelId((currentId) => (currentId === id ? undefined : currentId));
    };
  });

  const renderState = $derived({});
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
      renderState,
      { class: className, style: style },
      { id, 'aria-hidden': true, ...elementProps },
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, renderState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
