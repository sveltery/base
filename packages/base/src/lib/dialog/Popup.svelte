<script lang="ts">
  import { onDestroy } from 'svelte';
  import Element from './Element.svelte';
  import { portal, root } from './context.js';
  import { attachOverlay } from '../overlay/dialog-overlay.svelte.js';
  import type { ElementProps, FocusTarget, PopupState } from './types.js';
  let { children, render, initialFocus, finalFocus, id, ref = $bindable(null), ...props }: ElementProps<PopupState> & { initialFocus?: FocusTarget; finalFocus?: FocusTarget } = $props();
  const controller = root();
  portal();
  const generatedId = controller.generatedPopupId;
  const resolvedId = $derived(id ?? generatedId);
  const popupIdSource = () => resolvedId;
  controller.popupIdSource = popupIdSource;
  onDestroy(() => { if (controller.popupIdSource === popupIdSource) controller.popupIdSource = undefined; });
  function attach(node: HTMLElement) { return attachOverlay(node, controller, () => ({ initialFocus, finalFocus })); }
  const internal = $derived({ id: resolvedId, role: 'dialog', tabindex: -1, hidden: !controller.mounted,
    'aria-labelledby': controller.titleId, 'aria-describedby': controller.descriptionId,
    'data-open': controller.open ? '' : undefined, 'data-closed': !controller.open ? '' : undefined,
    'data-nested': controller.parent ? '' : undefined, 'data-nested-dialog-open': controller.nestedCount ? '' : undefined,
    'data-starting-style': controller.starting ? '' : undefined, 'data-ending-style': controller.exiting ? '' : undefined,
    style: { '--nested-dialogs': controller.nestedCount },
    onkeydown: (event: KeyboardEvent) => { if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key)) event.stopPropagation(); },
  });
</script>
<Element {internal} {props} state={controller.state} {render} {children} bind:ref {attach}/>
