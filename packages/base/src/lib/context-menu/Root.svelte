<script lang="ts">
  // Original ContextMenuRoot anchor/ref/provider composition (MIT).
  import MenuRoot from '../menu/Root.svelte';
  import { provideMenuRootContext } from '../menu/root/MenuRootContext.js';
  import { provideContextMenuRootContext, type ContextMenuRootContext } from './root/ContextMenuRootContext.js';
  import type { ContextMenuRootProps } from './types.js';
  let { children, actions = $bindable(null), ...props }: ContextMenuRootProps = $props();
  let anchor = $state.raw<ContextMenuRootContext['anchor']>({ getBoundingClientRect() { return DOMRect.fromRect({ width: 0, height: 0, x: 0, y: 0 }); } });
  const backdropRef = { current: null as HTMLDivElement | null };
  const internalBackdropRef = { current: null as HTMLDivElement | null };
  const actionsRef: ContextMenuRootContext['actionsRef'] = { current: null };
  const positionerRef = { current: null as HTMLElement | null };
  const allowMouseUpTriggerRef = { current: true };
  const initialCursorPointRef = { current: null as { x: number; y: number } | null };
  const rootId = $props.id();
  provideContextMenuRootContext({ get anchor() { return anchor; }, setAnchor(next) { anchor = next; }, actionsRef, backdropRef, internalBackdropRef, positionerRef, allowMouseUpTriggerRef, initialCursorPointRef, rootId });
  provideMenuRootContext(undefined);
</script>
<MenuRoot {...props} bind:actions>{@render children?.()}</MenuRoot>
