<script lang="ts">
  import { buttonKeys } from './button.js';
  import Element from './Element.svelte';
  import { root } from './context.js';
  import type { ButtonProps } from './types.js';
  let { children, render, disabled = false, nativeButton = true, ref = $bindable(null), ...props }: ButtonProps = $props();
  const controller = root();
  function activate(event: MouseEvent | KeyboardEvent) {
    if (disabled) { event.preventDefault(); return; }
    if (!controller.open) return;
    controller.closeMethod = event.type.startsWith('key') || (event instanceof MouseEvent && event.detail === 0) ? 'keyboard' : 'mouse';
    controller.request(false, 'close-press', event);
  }
  const internal = $derived({ type: nativeButton ? 'button' : undefined, disabled: nativeButton ? disabled : undefined,
    role: nativeButton ? undefined : 'button', tabindex: nativeButton ? undefined : disabled ? -1 : 0,
    'aria-disabled': !nativeButton && disabled ? true : undefined, 'data-disabled': disabled ? '' : undefined,
    onclick: activate,
    ...buttonKeys(() => disabled, () => nativeButton),
  });
</script>
<Element tag="button" {internal} {props} state={{ disabled }} {render} {children} bind:ref/>
