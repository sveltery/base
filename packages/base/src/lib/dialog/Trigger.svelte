<script lang="ts" generics="Payload = unknown">
  import { onMount, untrack } from 'svelte';
  import { buttonKeys } from './button.js';
  import Element from './Element.svelte';
  import { root } from './context.js';
  import type { TriggerProps } from './types.js';
  let { children, render, disabled = false, nativeButton = true, id, handle, payload, ref = $bindable(), ...props }: TriggerProps<Payload> = $props();
  const generated = $props.id();
  const contained = root(true);
  if (!contained && !untrack(() => handle)) throw new Error('Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.');
  let client = $state(false);
  onMount(() => { client = true; });
  const controller = $derived(handle ? client ? handle.store : handle.serverStore : contained);
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
    'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': controller.open && (controller.ownerId === resolvedId || (controller.ownerId == null && controller.triggers.size === 1)) ? controller.popupId : undefined, 'data-popup-open': open ? '' : undefined,
    onclick: activate,
    onpointerdown: (e: PointerEvent) => { controller.method = e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse'; },
    ...buttonKeys(() => disabled, () => nativeButton),
  });
  function attach(node: HTMLElement) {
    // Registry tracks reactive IDs as external DOM association.
    return $effect.root(() => {
      $effect.pre(() => {
        const store = controller; const key = resolvedId;
        untrack(() => { store.triggers.set(key, node); store.forwardTrigger(key, node, payload, true); });
        return () => { if (store.triggers.get(key) === node) store.triggers.delete(key); };
      });
      $effect.pre(() => {
        const store = controller; const key = resolvedId; const value = payload;
        if (store.mounted && store.ownerId === key) untrack(() => store.forwardTrigger(key, node, value, false));
      });
    });
  }
</script>
<Element tag="button" {internal} {props} state={{ disabled, open }} {render} {children} bind:ref {attach}/>
