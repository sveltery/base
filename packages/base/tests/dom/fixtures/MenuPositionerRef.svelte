<script lang="ts">
  import { Menu } from '../../../src/lib/menu/index.js';
  let { events }: { events: (HTMLElement | null)[] } = $props();
  let sideOffset = $state(0);
  let className = $state('initial');
  let positioner = $state<HTMLElement | null>(null);
  const getPositioner = () => positioner;
  const setPositioner = (node: HTMLElement | null) => { events.push(node); positioner = node; };
  export function updateOptions() { sideOffset = 10; className = 'updated'; }
</script>
<Menu.Root defaultOpen modal={false}>
  <Menu.Trigger>Open menu</Menu.Trigger>
  <Menu.Portal keepMounted>
    <Menu.Positioner {sideOffset} class={className} bind:ref={getPositioner, setPositioner}>
      <Menu.Popup><Menu.Item>Item</Menu.Item></Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
