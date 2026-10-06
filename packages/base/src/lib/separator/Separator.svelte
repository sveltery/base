<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Source-ordered Base UI v1.8.0 Separator.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import type { SeparatorProps, SeparatorState } from './types.js';
  let {
    class: classProp,
    render,
    orientation = 'horizontal',
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: SeparatorProps = $props();
  const state: SeparatorState = $derived({ orientation });

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
      state,
      { class: classProp, style: style },
      [{ role: 'separator', 'aria-orientation': orientation }, elementProps],
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
