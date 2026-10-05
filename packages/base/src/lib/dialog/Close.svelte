<script lang="ts">
  // Original DialogClose business/render/button composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { useDialogRootContext } from './context.js';
  import type { DialogCloseProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    disabled = false,
    nativeButton = true,
    ref = $bindable(),
    ...elementProps
  }: DialogCloseProps = $props();
  const store = useDialogRootContext();
  const { getButtonProps, buttonRef } = useButton(() => ({ disabled, native: nativeButton }));
  const state = $derived({ disabled });
  function handleClick(event: MouseEvent) {
    if (store.select('open'))
      store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
  }
</script>

<RenderElement
  tag="button"
  componentProps={{ render, class: className, style }}
  params={{
    state,
    ref: buttonRef,
    props: [{ onclick: handleClick }, elementProps, getButtonProps],
  }}
  {children}
  bind:element={ref}
/>
