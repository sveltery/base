<script lang="ts">
  // Authored actual public Source composition supplement; zero Original assertion credit.
  import { Menu, ContextMenu, Menubar, DirectionProvider, Toolbar } from '@sveltery/base';
  import type { MenuRootChangeEventDetails } from '@sveltery/base/menu';
  let { mode = 'ordinary', defaultOpen = false, keepMounted = false, cancel = '', direction = 'ltr', orientation = 'horizontal', log = () => {} }: {
    mode?: string; defaultOpen?: boolean; keepMounted?: boolean; cancel?: string;
    direction?: 'ltr' | 'rtl'; orientation?: 'horizontal' | 'vertical';
    log?: (kind: string, value: unknown, reason?: string) => void;
  } = $props();
  const handle = Menu.createHandle<number>();
  const onOpenChange = (open: boolean, details: MenuRootChangeEventDetails) => { if ((open && cancel === 'open') || (!open && cancel === 'close')) details.cancel(); log('open', open, details.reason); };
  let calls = $state<unknown[]>([]);
  let actions = $state<Menu.Root.Actions | null>(null);
  export function command(value: string) { if (value === 'open') handle.open('opener'); if (value === 'second') handle.open('second'); if (value === 'close') handle.close(); if (value === 'unmount') actions?.unmount(); }
  export function snapshot() { return { isOpen: handle.isOpen, actions: !!actions, calls }; }
  const itemLog = (kind: string, value: unknown, reason?: string) => { calls = [...calls, [kind, value, reason]]; log(kind, value, reason); };
</script>
{#snippet items()}
  <Menu.Group id="group"><Menu.GroupLabel id="group-label">Group label</Menu.GroupLabel>
    <Menu.Item id="alpha" onclick={() => itemLog('item', 'alpha')}>Alpha</Menu.Item>
    <Menu.Item id="disabled" disabled onclick={() => itemLog('item', 'disabled')}>Disabled</Menu.Item>
    <Menu.Item id="bravo" label="Bravo" onclick={() => itemLog('item', 'bravo')}>Custom Bravo</Menu.Item>
    <Menu.LinkItem id="link" href="#target">Link</Menu.LinkItem>
    <Menu.CheckboxItem id="check" onCheckedChange={(value, details) => { if (cancel === 'check') details.cancel(); itemLog('check', value, details.reason); }}>Check<Menu.CheckboxItemIndicator data-testid="check-indicator">✓</Menu.CheckboxItemIndicator></Menu.CheckboxItem>
    <Menu.RadioGroup id="radio-group" defaultValue="one" onValueChange={(value, details) => { if (cancel === 'radio') details.cancel(); itemLog('radio', value, details.reason); }}><Menu.GroupLabel id="radio-label">Radios</Menu.GroupLabel>
      <Menu.RadioItem id="one" value="one">One<Menu.RadioItemIndicator data-testid="one-indicator">✓</Menu.RadioItemIndicator></Menu.RadioItem>
      <Menu.RadioItem id="two" value="two">Two<Menu.RadioItemIndicator data-testid="two-indicator">✓</Menu.RadioItemIndicator></Menu.RadioItem>
    </Menu.RadioGroup>
    {#if mode === 'nested' || mode === 'context'}
      <Menu.SubmenuRoot><Menu.SubmenuTrigger id="sub" delay={0}>Submenu</Menu.SubmenuTrigger><Menu.Portal><Menu.Positioner data-testid="sub-positioner"><Menu.Popup data-testid="sub-popup"><Menu.Item id="sub-first">Sub first</Menu.Item><Menu.SubmenuRoot><Menu.SubmenuTrigger id="deep" delay={0}>Deep</Menu.SubmenuTrigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Item id="deep-first">Deep first</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.SubmenuRoot></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.SubmenuRoot>
    {/if}
  </Menu.Group>
{/snippet}
{#snippet popup(payload: number | undefined = undefined)}
  <Menu.Portal {keepMounted}><Menu.Backdrop data-testid="backdrop" /><Menu.Positioner data-testid="positioner" sideOffset={4}><Menu.Popup data-testid="popup"><Menu.Arrow data-testid="arrow" />
    {#if mode === 'viewport'}<Menu.Viewport data-testid="viewport"><output id="payload">{payload ?? 'none'}</output><Menu.Item id="alpha">Content {payload}</Menu.Item></Menu.Viewport>{:else}{@render items()}{/if}
  </Menu.Popup></Menu.Positioner></Menu.Portal>
{/snippet}
<DirectionProvider {direction}>
  {#if mode === 'context'}
    <ContextMenu.Root {defaultOpen} onOpenChange={(open, details) => itemLog('open', open, details.reason)}><ContextMenu.Trigger id="opener">Context area</ContextMenu.Trigger>{@render popup()}</ContextMenu.Root>
  {:else if mode === 'menubar'}
    <Menubar {orientation} modal={false} id="menubar"><Menu.Root modal={undefined} onOpenChange={onOpenChange}><Menu.Trigger id="opener">File</Menu.Trigger>{@render popup()}</Menu.Root><Menu.Root onOpenChange={onOpenChange}><Menu.Trigger id="second">Edit</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup data-testid="edit-popup"><Menu.Item id="edit-first">Edit first</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root></Menubar>
  {:else if mode === 'toolbar'}
    <Toolbar.Root><Toolbar.Button id="before">Before</Toolbar.Button><Menu.Root modal={false}><Menu.Trigger id="opener">Open</Menu.Trigger>{@render popup()}</Menu.Root><Toolbar.Button id="after">After</Toolbar.Button></Toolbar.Root>
  {:else if mode === 'detached' || mode === 'viewport'}
    <Menu.Trigger {handle} payload={7} id="opener">Open</Menu.Trigger><Menu.Trigger {handle} payload={9} id="second">Second</Menu.Trigger>
    <Menu.Root {handle} {defaultOpen} defaultTriggerId="opener" modal={false} bind:actions {onOpenChange} onOpenChangeComplete={open => itemLog('complete', open)}>{#snippet children({ payload })}{@render popup(payload)}{/snippet}</Menu.Root>
  {:else}
    <Menu.Root {defaultOpen} modal={false} bind:actions {onOpenChange} onOpenChangeComplete={open => itemLog('complete', open)}><Menu.Trigger id="opener" openOnHover={mode === 'hover'} delay={80} closeDelay={80}>Open</Menu.Trigger>{@render popup()}</Menu.Root>
  {/if}
</DirectionProvider>
<button id="outside">Outside</button>
