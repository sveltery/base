<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Source composition from Base UI v1.8.0 Button.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import type { ButtonProps } from './types.js';

  let {
    render,
    class: className,
    disabled = false,
    focusableWhenDisabled = false,
    nativeButton = true,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ButtonProps = $props();

  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    focusableWhenDisabled,
    native: nativeButton,
  }));
  const state = $derived({ disabled });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      buttonRef?.(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          buttonRef?.(null);
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [elementProps, getButtonProps],
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <button type="button" {...mergedProps}>{@render children?.()}</button>
{/if}
