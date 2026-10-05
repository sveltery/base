# NavigationMenu

NavigationMenu exposes the Original thirteen parts through both the package root and `@sveltery/base/navigation-menu`: Root, List, Item, Trigger, Content, Portal, Positioner, Popup, Viewport, Backdrop, Arrow, Link and Icon. Root selects the active Item value; null closes the menu. Falsy values such as `0`, `false` and `''` remain valid. Item generates a native stable ID only when its value is nullish.

```svelte
<script lang="ts">
  import { NavigationMenu } from '@sveltery/base/navigation-menu';
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="products">
      <NavigationMenu.Trigger>Products <NavigationMenu.Icon /></NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link href="/products" closeOnClick>All products</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.Portal>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
```

Controlled Root uses `value` and `onValueChange(nextValue, details)`; call `details.cancel()` to reject an interaction. `defaultValue` initializes uncontrolled selection. `delay` and `closeDelay` default to 50 ms. Supplying `bind:actions` opts into manual unmount, exposing only `actions.unmount()`. `Content keepMounted` includes hidden content in SSR, and `Portal keepMounted` retains popup nodes on close. Link closes on activation only when `closeOnClick` is true.

Each part accepts native Svelte attributes, class/style callbacks, a render snippet and `bind:ref`. Native ref attachments and context remain shared with the rest of the library. Root and each part preserve their public `.Props` and `.State` namespaces, and Root also exposes generic `.Value`, `.Actions`, `.ChangeEventReason` and `.ChangeEventDetails` types.

This is a source-first implementation draft. [Actual Source correspondence and execution limits](../parity/navigation-menu/IMPLEMENTATION.md) remain explicit: complete Original assertions/type-site correspondence, hydration, secured paired browser and independent final review are pending. No complete component or library parity is claimed.

[Native framework substitutions](../parity/navigation-menu/framework-substitutions.md) record generic component aliases, native anchor href types and context metadata replacements. These records grant no divergent assertion credit.
