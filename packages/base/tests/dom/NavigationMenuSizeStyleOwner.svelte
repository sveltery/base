<script lang="ts">
  import { NavigationMenu } from '../../src/lib/navigation-menu/index.js';
  let color = $state('red');
  export function updateColor(value: string) { color = value; }
</script>
<NavigationMenu.Root defaultValue="first">
  <NavigationMenu.List>
    <NavigationMenu.Item value="first"><NavigationMenu.Trigger>First</NavigationMenu.Trigger><NavigationMenu.Content>First content</NavigationMenu.Content></NavigationMenu.Item>
    <NavigationMenu.Item value="second"><NavigationMenu.Trigger>Second</NavigationMenu.Trigger><NavigationMenu.Content>Second content</NavigationMenu.Content></NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.Portal keepMounted>
    <NavigationMenu.Positioner data-size-positioner style={{ color }}>
      <NavigationMenu.Popup data-size-popup style={{ color }}><NavigationMenu.Viewport /></NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
