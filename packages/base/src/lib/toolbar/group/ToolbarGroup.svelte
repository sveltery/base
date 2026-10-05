<script lang="ts">
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Source-ordered Base UI v1.8.0 ToolbarGroup.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import { useToolbarRootContext } from '../root/ToolbarRootContext.js';
  import { setToolbarGroupContext } from './ToolbarGroupContext.js';
  import type { ToolbarGroupProps, ToolbarGroupState } from '../types.js';
  let {
    class: classProp,
    disabled: disabledProp = false,
    render,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ToolbarGroupProps = $props();
  const toolbar = useToolbarRootContext();
  const disabled = $derived(toolbar.disabled || disabledProp);
  setToolbarGroupContext({
    get disabled() {
      return disabled;
    },
  });
  const state: ToolbarGroupState = $derived({
    disabled,
    orientation: toolbar.orientation,
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
      state,
      { class: classProp, style: style },
      [{ role: 'group' }, elementProps],
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
