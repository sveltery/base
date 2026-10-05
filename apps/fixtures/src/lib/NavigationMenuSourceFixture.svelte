<script lang="ts">
  import { onMount } from 'svelte';
  import { NavigationMenu } from '@sveltery/base/navigation-menu';
  import { DirectionProvider } from '@sveltery/base/direction-provider';
  let { scenario, direction = 'ltr', orientation = 'horizontal', side = 'bottom' }: { scenario: string; direction?: 'ltr' | 'rtl'; orientation?: 'horizontal' | 'vertical'; side?: NavigationMenu.Positioner.Props['side'] } = $props();
  const falsy = $derived(scenario.endsWith('zero') ? 0 : scenario.endsWith('false') ? false : '');
  const inline = $derived(scenario.startsWith('inline') || scenario === 'dynamic' || scenario === 'orientation');
  const nested = $derived(inline || scenario === 'nested');
  let value = $state<unknown>('item-1');
  let contentStage = $state(0);
  let actions: NavigationMenu.Root.Actions | null = $state(null);
  const calls: { value: unknown; reason: string; type: string; canceled: boolean }[] = [];
  const completions: boolean[] = [];
  const rootProps = $derived<NavigationMenu.Root.Props>({
    orientation: scenario === 'orientation' ? 'vertical' : orientation,
    ...(scenario === 'orientation' ? { 'data-testid': 'top-level-root' } : {}),
    onValueChange(next, details) {
      if (scenario === 'cancel') details.cancel();
      calls.push({ value: next, reason: details.reason, type: details.event.type, canceled: details.isCanceled });
      if (scenario === 'controlled' || scenario === 'manual') value = next;
    },
    onOpenChangeComplete(open) { completions.push(open); },
    ...(['open', 'patient', 'orientation'].includes(scenario) ? { defaultValue: 'item-1' } : {}),
    ...(['controlled', 'manual'].includes(scenario) ? { value } : {}),
    ...(scenario === 'delay' ? { delay: 100 } : {}),
    ...(scenario === 'close-delay' ? { closeDelay: 100 } : {}),
  });
  onMount(() => {
    Object.assign(window, { navigationMenuSource: { snapshot: () => ({ calls: [...calls], completions: [...completions] }), setValue: (next: unknown) => { value = next; }, unmount: () => actions?.unmount() } });
    return () => { delete (window as unknown as { navigationMenuSource?: unknown }).navigationMenuSource; };
  });
</script>

{#snippet submenu()}
  <NavigationMenu.Root defaultValue={scenario.startsWith('inline-falsy-') ? falsy : inline && scenario !== 'inline-closed' ? 'nested-item-1' : undefined} orientation={scenario === 'orientation' ? 'vertical' : 'horizontal'} data-testid={scenario === 'orientation' ? 'nested-root' : undefined}>
    <NavigationMenu.List data-testid={scenario === 'orientation' ? 'nested-list' : inline && scenario !== 'dynamic' ? 'inline-nested-list' : undefined}>
      <NavigationMenu.Item value={scenario.startsWith('inline-falsy-') ? falsy : 'nested-item-1'}>
        <NavigationMenu.Trigger data-testid="nested-trigger-1">Nested Item 1</NavigationMenu.Trigger>
        <NavigationMenu.Content data-testid="nested-popup-1" keepMounted={scenario === 'inline-keep'}>
          {#if scenario === 'dynamic'}
            <button type="button" data-testid="insert-content" onclick={() => { contentStage = Math.min(contentStage + 1, 2); }}>Insert content</button>
            {#if contentStage >= 1}<div data-testid="extra-content"><NavigationMenu.Link href="#nested-link-1">Nested Link 1</NavigationMenu.Link><NavigationMenu.Link href="#nested-link-2">Nested Link 2</NavigationMenu.Link><NavigationMenu.Link href="#nested-link-3">Nested Link 3</NavigationMenu.Link></div>{/if}
            {#if contentStage >= 2}<div data-testid="extra-content-2"><NavigationMenu.Link href="#nested-link-4">Nested Link 4</NavigationMenu.Link><NavigationMenu.Link href="#nested-link-5">Nested Link 5</NavigationMenu.Link></div>{/if}
          {:else}<NavigationMenu.Link href="#nested-link-1">Nested Link 1</NavigationMenu.Link>{/if}
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      {#if inline && scenario !== 'orientation' && scenario !== 'dynamic'}
        <NavigationMenu.Item value="nested-item-2"><NavigationMenu.Trigger data-testid="nested-trigger-2">Nested Item 2</NavigationMenu.Trigger><NavigationMenu.Content data-testid="nested-popup-2" keepMounted={scenario === 'inline-keep'}><NavigationMenu.Link href="#nested-link-2">Nested Link 2</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
      {/if}
    </NavigationMenu.List>
    {#if inline}<NavigationMenu.Viewport data-testid={scenario.startsWith('inline') ? 'inline-nested-viewport' : undefined} />
    {:else}<NavigationMenu.Portal><NavigationMenu.Positioner side="right" data-testid="nested-positioner"><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal>{/if}
  </NavigationMenu.Root>
{/snippet}
{#snippet menu()}
  <NavigationMenu.List data-testid={scenario === 'orientation' ? 'top-level-list' : undefined}>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1" disabled={scenario === 'disabled'}>Item 1</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-1" keepMounted={scenario === 'inline-keep'}>
        {#if scenario !== 'orientation'}<NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>{/if}
        {#if nested}{@render submenu()}{:else if scenario !== 'top-link' && scenario !== 'disabled'}<NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>{/if}
      </NavigationMenu.Content>
    </NavigationMenu.Item>
    {#if scenario !== 'disabled' && scenario !== 'orientation' && scenario !== 'dynamic'}
      <NavigationMenu.Item value="item-2"><NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger><NavigationMenu.Content data-testid="popup-2" keepMounted={scenario === 'inline-keep'}><NavigationMenu.Link href={scenario === 'top-link' ? '#link-2' : '#link-3'}>{scenario === 'top-link' ? 'Link 2' : 'Link 3'}</NavigationMenu.Link>{#if !nested && scenario !== 'top-link'}<NavigationMenu.Link href="#link-4">Link 4</NavigationMenu.Link>{/if}</NavigationMenu.Content></NavigationMenu.Item>
    {/if}
    {#if scenario === 'top-link'}<NavigationMenu.Item><NavigationMenu.Link href="#top-level-link" data-testid="top-level-link">Top level link</NavigationMenu.Link></NavigationMenu.Item>{/if}
  </NavigationMenu.List>
  <NavigationMenu.Portal keepMounted={scenario === 'kept-portal'}><NavigationMenu.Positioner data-testid={scenario.startsWith('inline') || scenario === 'dynamic' ? 'positioner' : 'top-level-positioner'}><NavigationMenu.Popup data-testid="popup-root"><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal>
{/snippet}
<DirectionProvider {direction}>
  {#if scenario.startsWith('focus')}<!-- svelte-ignore a11y_consider_explicit_label (Exact archived outside-focus button fixture.) --><button data-testid="first"></button>{/if}
  {#if scenario === 'keyboard' || scenario === 'side'}<NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item value={scenario === 'side' ? 'item-1' : undefined}><NavigationMenu.Trigger data-testid="trigger-1">{scenario === 'side' ? 'Item 1' : 'Overview'}</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href={scenario === 'side' ? '#link-1' : '#quick-start'}>{scenario === 'side' ? 'Link 1' : 'Quick Start'}</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner side={scenario === 'side' ? side : undefined}><NavigationMenu.Popup data-testid="popup-root"><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>
  {:else if scenario.startsWith('falsy-')}<NavigationMenu.Root onValueChange={rootProps.onValueChange}><NavigationMenu.List><NavigationMenu.Item value={falsy}><NavigationMenu.Trigger data-testid="trigger-0">Zero</NavigationMenu.Trigger><NavigationMenu.Content data-testid="popup-0"><NavigationMenu.Link href="#link-0">Zero link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>
  {:else if scenario === 'manual'}<NavigationMenu.Root {...rootProps} bind:actions>{@render menu()}</NavigationMenu.Root>{:else}<NavigationMenu.Root {...rootProps}>{@render menu()}</NavigationMenu.Root>{/if}
  {#if scenario === 'focus'}<!-- svelte-ignore a11y_consider_explicit_label (Exact archived outside-focus button fixture.) --><button data-testid="last"></button>{/if}
</DirectionProvider>
