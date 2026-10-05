<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original MenuGroup label/provider/render composition (MIT).
  import {
    provideMenuGroupContext,
    type MenuGroupContext,
  } from './group/MenuGroupContext.js';
  import type { MenuGroupProps } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuGroupProps = $props();
  let labelId = $state<string | undefined>(undefined);
  const setLabelId: MenuGroupContext = (value) => {
    labelId = typeof value === 'function' ? value(labelId) : value;
  };
  provideMenuGroupContext(setLabelId);

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
      { role: 'group', 'aria-labelledby': labelId, ...elementProps },
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
