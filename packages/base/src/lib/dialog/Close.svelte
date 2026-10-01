<script lang="ts">
  import Element from './Element.svelte';
  import { root } from './context.js';
  import type { ButtonProps } from './types.js';
  let { children, render, disabled = false, nativeButton = true, ref = $bindable(null), ...props }: ButtonProps = $props();
  const controller = root();
  function activate(event: MouseEvent | KeyboardEvent) {
    if (disabled || !controller.open) return;
    controller.closeMethod = event.type.startsWith('key') || (event instanceof MouseEvent && event.detail === 0) ? 'keyboard' : 'mouse';
    controller.request(false, 'close-press', event);
  }
  const internal = $derived({ type: nativeButton ? 'button' : undefined, disabled: nativeButton ? disabled : undefined,
    role: nativeButton ? undefined : 'button', tabindex: nativeButton ? undefined : 0,
    'aria-disabled': !nativeButton && disabled ? true : undefined, 'data-disabled': disabled ? '' : undefined,
    onclick: activate,
    onkeydown: (e: KeyboardEvent) => { if (!nativeButton && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (e.key === 'Enter') activate(e); } },
    onkeyup: (e: KeyboardEvent) => { if (!nativeButton && e.key === ' ') { e.preventDefault(); activate(e); } },
  });
</script>
<Element tag="button" {internal} {props} state={{ disabled }} {render} {children} bind:ref/>
