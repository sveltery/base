<script lang="ts">
  // Native render trees of the immutable selected Original part assertions; MIT.
  import { onMount } from 'svelte';
  import { NavigationMenu } from '@sveltery/base/navigation-menu';
  let { scenario }: { scenario: string } = $props();
  let showFirst = $state(true);
  let disabled = $state(true);
  let value = $state<string | null>(null);
  let aIsActive = $state(false);
  const keys: string[] = [];
  onMount(() => {
    Object.assign(window, { navigationMenuParts: { snapshot: () => ({ keys: [...keys] }), removeFirst: () => { showFirst = false; }, navigate: () => { value = null; aIsActive = true; } } });
    return () => { delete (window as unknown as { navigationMenuParts?: unknown }).navigationMenuParts; };
  });
</script>

{#snippet portal(keepMounted = false, viewport = true, popupId: string | undefined = undefined)}
  <NavigationMenu.Portal {keepMounted}><NavigationMenu.Positioner><NavigationMenu.Popup data-testid={popupId}>
    {#if viewport}<NavigationMenu.Viewport data-testid={scenario.startsWith('content-') ? 'viewport' : undefined} />{:else}Popup{/if}
  </NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal>
{/snippet}
{#snippet basicItem(keepMounted = false)}
  <NavigationMenu.Item>
    <NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
    <NavigationMenu.Content {keepMounted} data-testid="content-1"><NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link></NavigationMenu.Content>
  </NavigationMenu.Item>
{/snippet}
{#if scenario === 'content-kept' || scenario === 'content-unkept'}
  <NavigationMenu.Root><NavigationMenu.List>{@render basicItem(scenario === 'content-kept')}</NavigationMenu.List>{@render portal()}</NavigationMenu.Root>
{:else if scenario === 'content-move' || scenario === 'content-close'}
  <NavigationMenu.Root><NavigationMenu.List data-testid={scenario === 'content-move' ? 'list' : undefined}>
    <NavigationMenu.Item value="item-1"><NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger><NavigationMenu.Content keepMounted data-testid="content-1"><NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
    {#if scenario === 'content-move'}<NavigationMenu.Item value="item-2"><NavigationMenu.Trigger>Item 2</NavigationMenu.Trigger><NavigationMenu.Content keepMounted data-testid="content-2"><NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>{/if}
  </NavigationMenu.List>{@render portal(scenario === 'content-close')}</NavigationMenu.Root>
{:else if scenario === 'link-active' || scenario === 'link-inactive'}
  <NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item><NavigationMenu.Link href="#" active={scenario === 'link-active'}>{scenario === 'link-active' ? 'active' : 'inactive'}</NavigationMenu.Link></NavigationMenu.Item></NavigationMenu.List></NavigationMenu.Root>
{:else if scenario === 'link-close' || scenario === 'link-keep' || scenario === 'link-blur'}
  <NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item value="item-1">
    <NavigationMenu.Trigger data-testid={scenario === 'link-blur' ? undefined : 'trigger-1'}>Item 1</NavigationMenu.Trigger>
    <NavigationMenu.Content data-testid={scenario === 'link-blur' ? undefined : 'popup-1'}><NavigationMenu.Link href="#link-1" closeOnClick={scenario === 'link-close'}>Link 1</NavigationMenu.Link></NavigationMenu.Content>
  </NavigationMenu.Item></NavigationMenu.List>{@render portal()}</NavigationMenu.Root>
{:else if scenario === 'list-keys'}
  <!-- svelte-ignore a11y_no_static_element_interactions (Original key propagation observer.) -->
  <div onkeydown={(event) => { keys.push(event.key); }}><NavigationMenu.Root orientation="vertical"><NavigationMenu.List data-testid="list"><NavigationMenu.Item><NavigationMenu.Trigger>Item</NavigationMenu.Trigger></NavigationMenu.Item></NavigationMenu.List></NavigationMenu.Root></div>
{:else if scenario === 'custom-list'}
  <NavigationMenu.Root><NavigationMenu.List>
    {#snippet render(props, _state, children)}<div {...props} data-testid="custom-list">{@render children?.()}</div>{/snippet}
    {#each [1, 2] as n (n)}<NavigationMenu.Item value={n === 1 ? 'item' : 'item-2'}><NavigationMenu.Trigger>Trigger {n}</NavigationMenu.Trigger><NavigationMenu.Content>Content {n}</NavigationMenu.Content></NavigationMenu.Item>{/each}
  </NavigationMenu.List>{@render portal()}</NavigationMenu.Root>
{:else if scenario === 'arbitrary'}
  <div><NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item value="item"><NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger><NavigationMenu.Content><button>Action</button></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List>{@render portal(false, true, 'popup')}</NavigationMenu.Root><button>After menu</button></div>
{:else if scenario === 'no-viewport'}
  <NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item value="item"><NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger><NavigationMenu.Content>Content</NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List>{@render portal(false, false)}</NavigationMenu.Root>
{:else if scenario === 'icons'}
  <NavigationMenu.Root defaultValue="item-1"><NavigationMenu.List>{#each [1, 2] as n (n)}<NavigationMenu.Item value={`item-${n}`}><NavigationMenu.Trigger>Item {n}<NavigationMenu.Icon data-testid={`icon-${n}`} /></NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href={`#link-${n}`}>Link {n}</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>{/each}</NavigationMenu.List>{@render portal()}</NavigationMenu.Root>
{:else if scenario === 'list-removal'}
  <NavigationMenu.Root><NavigationMenu.List>
    {#if showFirst}<NavigationMenu.Item><NavigationMenu.Trigger data-testid="first">One</NavigationMenu.Trigger></NavigationMenu.Item>{/if}
    <NavigationMenu.Item><NavigationMenu.Trigger data-testid="middle">Two</NavigationMenu.Trigger></NavigationMenu.Item>
    <NavigationMenu.Item><NavigationMenu.Trigger data-testid="last">Three</NavigationMenu.Trigger></NavigationMenu.Item>
  </NavigationMenu.List></NavigationMenu.Root>
{:else if scenario === 'trigger-enable'}
  <div><NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item><NavigationMenu.Trigger {disabled} data-testid="trigger">Overview</NavigationMenu.Trigger></NavigationMenu.Item></NavigationMenu.List></NavigationMenu.Root><button type="button" onclick={() => { disabled = false; }}>enable</button></div>
{:else if scenario === 'drop-trigger'}
  <NavigationMenu.Root {value} onValueChange={(next) => { value = next; }}><NavigationMenu.List data-testid="list">
    {#if aIsActive}<NavigationMenu.Item value="a"><a href="#a">A active</a></NavigationMenu.Item>{:else}<NavigationMenu.Item value="a"><NavigationMenu.Trigger>A</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="#a">A link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>{/if}
    <NavigationMenu.Item value="b"><NavigationMenu.Trigger>B</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="#b">B link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
  </NavigationMenu.List>{@render portal()}</NavigationMenu.Root>
{:else if scenario === 'sweep'}
  <NavigationMenu.Root><NavigationMenu.List data-testid="list">{#each ['a', 'b'] as letter (letter)}<NavigationMenu.Item value={letter}><NavigationMenu.Trigger>{letter.toUpperCase()}</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href={`#${letter}`}>{letter.toUpperCase()} link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>{/each}</NavigationMenu.List>{@render portal(true)}</NavigationMenu.Root>
{:else if scenario === 'kept-transitions'}
  <NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item value="item-1">
    <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
    <NavigationMenu.Content><NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link></NavigationMenu.Content>
  </NavigationMenu.Item></NavigationMenu.List>
    <NavigationMenu.Portal keepMounted><NavigationMenu.Positioner><NavigationMenu.Popup data-testid="popup-root"><NavigationMenu.Arrow data-testid="arrow" /><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal>
  </NavigationMenu.Root>
{:else if scenario === 'trigger-height'}
  <NavigationMenu.Root><NavigationMenu.List>
    <NavigationMenu.Item><NavigationMenu.Trigger>Overview</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="#">Quick Start</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
    <NavigationMenu.Item><NavigationMenu.Trigger>Handbook</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="#">Styling Base UI components</NavigationMenu.Link></NavigationMenu.Content><NavigationMenu.Content><NavigationMenu.Link href="#">Second Link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
  </NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner data-testid="positioner"><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>
{:else if scenario === 'trigger-width'}
  <NavigationMenu.Root><NavigationMenu.List>
    <NavigationMenu.Item><NavigationMenu.Trigger>noContent</NavigationMenu.Trigger></NavigationMenu.Item>
    <NavigationMenu.Item><NavigationMenu.Trigger>withContent</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="#">Styling Base UI components</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
  </NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner data-testid="positioner"><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>
{:else if scenario === 'trigger-reposition'}
  <NavigationMenu.Root><NavigationMenu.List style={{ display: 'flex' }}>
    <NavigationMenu.Item><NavigationMenu.Trigger>Overview</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="#">Overview Link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
    <NavigationMenu.Item><NavigationMenu.Trigger>Handbook</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="#">Handbook Link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
  </NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner data-testid="positioner"><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>
{/if}
