// Actual Base UI v1.8.0 / React 19.2.8 fixture; MIT: parity/navigation-menu/UPSTREAM_LICENSE.
import * as React from 'react';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { DirectionProvider } from '@base-ui/react/direction-provider';
const h = React.createElement;
type FixtureProps = { scenario: string; direction: 'ltr' | 'rtl'; orientation: 'horizontal' | 'vertical'; onHydrated?: () => void };
export function NavigationMenuReference({ scenario, direction, orientation, onHydrated }: FixtureProps) {
  const [ownerValue, setOwnerValue] = React.useState<unknown>(scenario === 'controlled' ? null : scenario === 'manual' ? 'first' : undefined);
  const [shown, setShown] = React.useState(true);
  const [firstShown, setFirstShown] = React.useState(true);
  const [dynamicText, setDynamicText] = React.useState('First content');
  const actions = React.useRef<NavigationMenu.Root.Actions | null>(null);
  const calls = React.useRef<{ value: unknown; reason: string; type: string; canceled: boolean }[]>([]);
  const completions = React.useRef<boolean[]>([]);
  const keep = scenario === 'keep' || scenario === 'ssr-keep' || scenario === 'content-keep';
  const keepPortal = scenario === 'keep';
  const initial = scenario === 'open' || scenario === 'manual' || scenario === 'nested' ? 'first' : null;
  const firstValue = scenario === 'zero' ? 0 : scenario === 'false' ? false : scenario === 'empty' ? '' : 'first';
  React.useEffect(() => {
    const api = { snapshot: () => ({ calls: calls.current, completions: completions.current }), setValue: setOwnerValue, removeFirst: () => setFirstShown(false), removeRoot: () => setShown(false), setContent: setDynamicText, unmount: () => actions.current?.unmount() };
    Object.assign(window, { navigationMenuFixture: api });
    onHydrated?.();
    return () => { delete (window as unknown as { navigationMenuFixture?: unknown }).navigationMenuFixture; };
  }, [onHydrated]);
  function nestedMenu() {
    return h(NavigationMenu.Root, { defaultValue: 'sub-first', id: 'nested-root' },
      h(NavigationMenu.List, { id: 'nested-list' }, ...['first', 'second'].map(value => h(NavigationMenu.Item, { key: value, value: `sub-${value}` }, h(NavigationMenu.Trigger, { id: `sub-${value}-trigger` }, `Sub ${value}`), h(NavigationMenu.Content, { id: `sub-${value}-content`, keepMounted: true }, h(NavigationMenu.Link, { id: `sub-${value}-link`, href: '#nested', closeOnClick: true }, `Sub ${value} link`))))),
      h(NavigationMenu.Viewport, { id: 'nested-viewport' }));
  }
  const menu = [
    h(NavigationMenu.List, { key: 'list', id: 'tested-list' },
      firstShown ? h(NavigationMenu.Item, { value: firstValue, id: 'tested-item' }, h(NavigationMenu.Trigger, { id: 'first-trigger', disabled: scenario === 'disabled' }, 'First ', h(NavigationMenu.Icon, { id: 'tested-icon' })), h(NavigationMenu.Content, { id: 'first-content', keepMounted: keep }, h(NavigationMenu.Link, { id: 'first-link', href: '#first', active: true, closeOnClick: scenario === 'link-close' }, dynamicText), h(NavigationMenu.Link, { id: 'last-link', href: '#last' }, 'Last link'), scenario === 'nested' ? nestedMenu() : null)) : null,
      h(NavigationMenu.Item, { value: 'second' }, h(NavigationMenu.Trigger, { id: 'second-trigger' }, 'Second'), h(NavigationMenu.Content, { id: 'second-content', keepMounted: keep }, h(NavigationMenu.Link, { id: 'second-link', href: '#second' }, 'Second content')))),
    h(NavigationMenu.Portal, { key: 'portal', keepMounted: keepPortal }, h(NavigationMenu.Backdrop, { id: 'tested-backdrop' }), h(NavigationMenu.Positioner, { id: 'tested-positioner', side: scenario === 'origin-left' ? 'left' : 'bottom' }, h(NavigationMenu.Popup, { id: 'tested-popup' }, h(NavigationMenu.Arrow, { id: 'tested-arrow' }), h(NavigationMenu.Viewport, { id: 'tested-viewport' })))),
  ];
  return h('main', { 'data-hydrated': true }, h(DirectionProvider, { direction },
    h('button', { id: 'before' }, 'Before'), shown ? h(NavigationMenu.Root, { id: 'tested-root', orientation, defaultValue: initial, value: ownerValue, actionsRef: scenario === 'manual' ? actions : undefined,
      onValueChange(value, details) { if (scenario === 'cancel') details.cancel(); calls.current.push({ value, reason: details.reason, type: details.event.type, canceled: details.isCanceled }); },
      onOpenChangeComplete(open) { completions.current.push(open); },
    }, menu) : null, h('button', { id: 'after' }, 'After')));
}
