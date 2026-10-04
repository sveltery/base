<!-- Authored actual Source/native regression; zero Original declaration credit. -->
<script lang="ts">
import * as Menu from '../../../src/lib/menu/index.parts.ts';
const first=Menu.createHandle();
const second=Menu.createHandle();
let handle=$state.raw(first);
export function switchHandle(){handle=second;}
export function pointerType(){return handle.store.select('floatingRootContext').context.dataRef.current.hoverInteractionState?.pointerType;}
</script>
<Menu.Trigger {handle} id="detached-hover" openOnHover>Open</Menu.Trigger>
<Menu.Root handle={first} defaultOpen><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Item>Item</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>
<Menu.Root handle={second} defaultOpen><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Item>Second</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>
