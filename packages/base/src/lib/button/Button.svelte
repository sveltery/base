<script lang="ts">
  // Source composition from Base UI v1.8.0 Button.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
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
</script>

<RenderElement
  tag="button"
  componentProps={{ render, class: className, style }}
  params={{ state, ref: [buttonRef], props: [elementProps, getButtonProps] }}
  {children}
  bind:element={ref}
/>
