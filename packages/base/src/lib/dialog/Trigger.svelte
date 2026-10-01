<script lang="ts">
  import { buttonKeys } from './button.js';
  import Element from './Element.svelte';
  import { root } from './context.js';
  import type { ButtonProps } from './types.js';
  let { children, render, disabled = false, nativeButton = true, id, ref = $bindable(null), ...props }: ButtonProps = $props();
  const generated = $props.id();
  const controller = root();
  const resolvedId = $derived(id ?? `base-ui-${generated}`);
  const open = $derived(controller.open && controller.ownerId === resolvedId);
  function activate(event: MouseEvent | KeyboardEvent) {
    if (disabled) { event.preventDefault(); return; }
    controller.method = event.type.startsWith('key') || (event instanceof MouseEvent && event.detail === 0) ? 'keyboard' : controller.method;
    if (open) controller.closeMethod = controller.method;
    controller.request(!open, 'trigger-press', event, ref ?? undefined);
  }
  const internal = $derived({ id: resolvedId, type: nativeButton ? 'button' : undefined, disabled: nativeButton ? disabled : undefined,
    role: nativeButton ? undefined : 'button', tabindex: nativeButton ? undefined : disabled ? -1 : 0,
    'aria-disabled': !nativeButton && disabled ? true : undefined, 'data-disabled': disabled ? '' : undefined,
    'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': open ? controller.popupId : undefined, 'data-popup-open': open ? '' : undefined,
    onclick: activate,
    onpointerdown: (e: PointerEvent) => { controller.method = e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse'; },
    ...buttonKeys(() => disabled, () => nativeButton),
  });
  function attach(node: HTMLElement) {
    // Registry tracks reactive IDs as external DOM association.
    return $effect.root(() => {
      $effect(() => { const key = resolvedId; controller.triggers.set(key, node); return () => { controller.triggers.delete(key); }; });
    });
  }
</script>
<Element tag="button" {internal} {props} state={{ disabled, open }} {render} {children} bind:ref {attach}/>
