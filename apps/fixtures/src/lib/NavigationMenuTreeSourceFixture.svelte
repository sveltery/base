<script lang="ts">
  import { NavigationMenu } from '@sveltery/base/navigation-menu';
  import TreeFixture from './NavigationMenuTreeSourceFixture.svelte';
  import type { SourceTree } from './navigation-menu-source-trees.js';
  import { scopedPopupAnimationStyles } from './navigation-menu-source-styles.js';
  let { tree, rootProps = {} }: { tree: SourceTree; rootProps?: NavigationMenu.Root.Props } = $props();
</script>
<NavigationMenu.Root {...rootProps} {...tree.root}>
  {#if tree.scopedStyles}<svelte:element this={'style'}>{scopedPopupAnimationStyles}</svelte:element>{/if}
  <NavigationMenu.List data-testid={tree.listTestId}>
    {#each tree.items as item}
      <NavigationMenu.Item value={item.value}>
        {#if item.directLink}<NavigationMenu.Link href={item.directLink.href} data-testid={item.directLink.id}>{item.directLink.text}</NavigationMenu.Link>
        {:else}
          <NavigationMenu.Trigger data-testid={item.triggerId}>{item.trigger}</NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid={item.contentId} class={item.contentClass} keepMounted={item.keepContent}>
            {#each item.links ?? [] as link}<NavigationMenu.Link href={link.href} data-testid={link.id} closeOnClick={link.close}>{link.text}</NavigationMenu.Link>{/each}
            {#if item.children}<TreeFixture tree={item.children} />{/if}
            {#if item.box}<div style={`width: ${item.box.width}px; height: ${item.box.height}px`}>{item.box.text}</div>{/if}
          </NavigationMenu.Content>
        {/if}
      </NavigationMenu.Item>
    {/each}
  </NavigationMenu.List>
  {#if tree.portal !== false}<NavigationMenu.Portal keepMounted={tree.keepPortal}><NavigationMenu.Positioner side={tree.positionerSide} data-testid={tree.positionerTestId}><NavigationMenu.Popup data-testid={tree.popupTestId} class={tree.popupClass}><NavigationMenu.Viewport data-testid={tree.viewportTestId} /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal>
  {:else}<NavigationMenu.Viewport data-testid={tree.viewportTestId} />{/if}
</NavigationMenu.Root>
