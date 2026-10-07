<script lang="ts">
  // Source: Base UI v1.8.0 ListboxSeparator.tsx at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import type { ListboxSeparatorProps, ListboxSeparatorState } from './types.js';

  let {
    class: classProp,
    render,
    orientation = 'horizontal',
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ListboxSeparatorProps = $props();

  const state: ListboxSeparatorState = $derived({ orientation });
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
    ...mergeComponentProps(state, { class: classProp, style }, [
      { role: 'presentation' },
      elementProps,
    ]),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
