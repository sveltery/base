// Authored counterpart using actual Original Base UI 1.8.0; zero Original assertion credit.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Menu } from '@base-ui/react/menu';
import { ContextMenu } from '@base-ui/react/context-menu';
import { Menubar } from '@base-ui/react/menubar';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Toolbar } from '@base-ui/react/toolbar';
const h = React.createElement;
const testId = (value: string): Pick<React.HTMLAttributes<HTMLElement>, 'id'> & { 'data-testid': string } => ({ 'data-testid': value });
export function mountMenuFamilyReference(target: HTMLElement, options: { mode?: string; defaultOpen?: boolean; keepMounted?: boolean; cancel?: string; direction?: 'ltr' | 'rtl'; orientation?: 'horizontal' | 'vertical'; log?: (kind: string, value: unknown, reason?: string) => void } = {}) {
  const { mode = 'ordinary', defaultOpen = false, keepMounted = false, cancel = '', direction = 'ltr', orientation = 'horizontal', log = () => {} } = options;
  const handle = Menu.createHandle<number>();
  let actions: Menu.Root.Actions | null = null;
  const calls: unknown[] = [];
  const itemLog = (kind: string, value: unknown, reason?: string) => { calls.push([kind, value, reason]); log(kind, value, reason); };
  const onOpenChange: NonNullable<Menu.Root.Props['onOpenChange']> = (open, details) => { if ((open && cancel === 'open') || (!open && cancel === 'close')) details.cancel(); log('open', open, details.reason); };
  const items = () => h(Menu.Group, { id: 'group' }, h(Menu.GroupLabel, { id: 'group-label' }, 'Group label'),
    h(Menu.Item, { id: 'alpha', onClick: () => itemLog('item', 'alpha') }, 'Alpha'),
    h(Menu.Item, { id: 'disabled', disabled: true, onClick: () => itemLog('item', 'disabled') }, 'Disabled'),
    h(Menu.Item, { id: 'bravo', label: 'Bravo', onClick: () => itemLog('item', 'bravo') }, 'Custom Bravo'),
    h(Menu.LinkItem, { id: 'link', href: '#target' }, 'Link'),
    h(Menu.CheckboxItem, { id: 'check', onCheckedChange(value, details) { if (cancel === 'check') details.cancel(); itemLog('check', value, details.reason); } }, 'Check', h(Menu.CheckboxItemIndicator, { ...testId('check-indicator') }, '✓')),
    h(Menu.RadioGroup, { id: 'radio-group', defaultValue: 'one', onValueChange(value, details) { if (cancel === 'radio') details.cancel(); itemLog('radio', value, details.reason); } }, h(Menu.GroupLabel, { id: 'radio-label' }, 'Radios'), h(Menu.RadioItem, { id: 'one', value: 'one' }, 'One', h(Menu.RadioItemIndicator, { ...testId('one-indicator') }, '✓')), h(Menu.RadioItem, { id: 'two', value: 'two' }, 'Two', h(Menu.RadioItemIndicator, { ...testId('two-indicator') }, '✓'))),
    mode === 'nested' || mode === 'context' ? h(Menu.SubmenuRoot, null, h(Menu.SubmenuTrigger, { id: 'sub', delay: 0 }, 'Submenu'), h(Menu.Portal, null, h(Menu.Positioner, { ...testId('sub-positioner') }, h(Menu.Popup, { ...testId('sub-popup') }, h(Menu.Item, { id: 'sub-first' }, 'Sub first'), h(Menu.SubmenuRoot, null, h(Menu.SubmenuTrigger, { id: 'deep', delay: 0 }, 'Deep'), h(Menu.Portal, null, h(Menu.Positioner, null, h(Menu.Popup, null, h(Menu.Item, { id: 'deep-first' }, 'Deep first'))))))))) : null);
  const popup = (payload?: number) => h(Menu.Portal, { keepMounted }, h(Menu.Backdrop, { ...testId('backdrop') }), h(Menu.Positioner, { ...testId('positioner'), sideOffset: 4 }, h(Menu.Popup, { ...testId('popup') }, h(Menu.Arrow, { ...testId('arrow') }), mode === 'viewport' ? h(Menu.Viewport, { ...testId('viewport') }, h('output', { id: 'payload' }, payload ?? 'none'), h(Menu.Item, { id: 'alpha' }, `Content ${payload}`)) : items())));
  function Fixture() {
    const actionRef = React.useRef<Menu.Root.Actions | null>(null);
    React.useLayoutEffect(() => { actions = actionRef.current; return () => { actions = null; }; });
    let content: React.ReactNode;
    if (mode === 'context') content = h(ContextMenu.Root, { defaultOpen, onOpenChange: (open, details) => itemLog('open', open, details.reason) }, h(ContextMenu.Trigger, { id: 'opener' }, 'Context area'), popup());
    else if (mode === 'menubar') content = h(Menubar, { orientation, modal: false, id: 'menubar' }, h(Menu.Root, { onOpenChange }, h(Menu.Trigger, { id: 'opener' }, 'File'), popup()), h(Menu.Root, { onOpenChange }, h(Menu.Trigger, { id: 'second' }, 'Edit'), h(Menu.Portal, null, h(Menu.Positioner, null, h(Menu.Popup, { ...testId('edit-popup') }, h(Menu.Item, { id: 'edit-first' }, 'Edit first'))))));
    else if (mode === 'toolbar') content = h(Toolbar.Root, null, h(Toolbar.Button, { id: 'before' }, 'Before'), h(Menu.Root, { modal: false }, h(Menu.Trigger, { id: 'opener' }, 'Open'), popup()), h(Toolbar.Button, { id: 'after' }, 'After'));
    else if (mode === 'detached' || mode === 'viewport') content = h(React.Fragment, null, h(Menu.Trigger, { handle, payload: 7, id: 'opener' }, 'Open'), h(Menu.Trigger, { handle, payload: 9, id: 'second' }, 'Second'), h(Menu.Root<number>, { handle, defaultOpen, defaultTriggerId: 'opener', modal: false, actionsRef: actionRef, onOpenChange, onOpenChangeComplete: open => itemLog('complete', open), children: ({ payload }) => popup(payload) }));
    else content = h(Menu.Root, { defaultOpen, modal: false, actionsRef: actionRef, onOpenChange, onOpenChangeComplete: open => itemLog('complete', open) }, h(Menu.Trigger, { id: 'opener', openOnHover: mode === 'hover', delay: 80, closeDelay: 80 }, 'Open'), popup());
    return h(DirectionProvider, { direction }, content, h('button', { id: 'outside' }, 'Outside'));
  }
  const root = createRoot(target); root.render(h(Fixture));
  return { stop: () => root.unmount(), command(value: string) { if (value === 'open') handle.open('opener'); if (value === 'second') handle.open('second'); if (value === 'close') handle.close(); if (value === 'unmount') actions?.unmount(); }, snapshot() { return { isOpen: handle.isOpen, actions: !!actions, calls }; } };
}
