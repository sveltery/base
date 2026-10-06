// Base UI v1.8.0 actual React19.2.8 reference fixtures; MIT: parity/toggle-toolbar/UPSTREAM_LICENSE.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Toolbar } from '@base-ui/react/toolbar';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { navigationCase, type NavigationCall } from './navigation-cases.js';
import type { ToggleChangeEventDetails } from '@base-ui/react/toggle';
const h = React.createElement;
export function mountNavigationReference(
  host: HTMLElement,
  scenario: string,
  direction: 'ltr' | 'rtl',
  orientation: 'horizontal' | 'vertical',
) {
  function Fixture() {
    const config = navigationCase(scenario);
    const [owner, setOwner] = React.useState<string[] | undefined>(() =>
      config.controlled ? ['two'] : undefined,
    );
    const [multiple, setMultiple] = React.useState(config.multiple);
    const [itemDisabled, setItemDisabled] = React.useState(config.disabled);
    const [inputDisabled, setInputDisabled] = React.useState(config.inputDisabled);
    const [focusable, setFocusable] = React.useState(!config.nonFocusable);
    const [shown, setShown] = React.useState(true);
    const [items, setItems] = React.useState(['one', 'two', 'three']);
    const [calls, setCalls] = React.useState<NavigationCall[]>([]);
    const [clicks, setClicks] = React.useState(0),
      [hover, setHover] = React.useState(0),
      [keydowns, setKeydowns] = React.useState(0),
      [resets, setResets] = React.useState(0);
    const detailsIdentity = React.useRef<ToggleChangeEventDetails | undefined>(undefined);
    function ownChange(next: boolean, details: ToggleChangeEventDetails) {
      detailsIdentity.current = details;
      if (config.ownCancel) details.cancel();
      setCalls((previous) => [
        ...previous,
        {
          part: 'toggle',
          value: next,
          same: true,
          reason: details.reason,
          type: details.event.type,
          canceled: details.isCanceled,
          defaultPrevented: details.event.defaultPrevented,
          before: document.getElementById('one')?.getAttribute('aria-pressed') ?? null,
        },
      ]);
    }
    function groupChange(next: string[], details: ToggleChangeEventDetails) {
      if (config.groupCancel) details.cancel();
      setCalls((previous) => [
        ...previous,
        {
          part: 'group',
          value: next,
          same: details === detailsIdentity.current,
          reason: details.reason,
          type: details.event.type,
          canceled: details.isCanceled,
          defaultPrevented: details.event.defaultPrevented,
          before: document.getElementById('one')?.getAttribute('aria-pressed') ?? null,
        },
      ]);
      if (config.accept) setOwner(next);
    }
    const button = (label: string, callback: () => void) =>
      h('button', { key: label, onClick: callback }, label);
    const group = () =>
      h(
        ToggleGroup,
        {
          id: 'selection-group',
          disabled: config.groupRootDisabled,
          multiple,
          value: owner,
          defaultValue: config.initialized ? ['one'] : config.defaultValue,
          onValueChange: groupChange,
          orientation,
          loopFocus: config.loopFocus,
        },
        ...items.map((value) =>
          config.wrapped
            ? h(
                Toolbar.Button,
                {
                  key: value,
                  id: value,
                  value,
                  disabled: itemDisabled,
                  render: h(Toggle, { onPressedChange: ownChange }),
                },
                value,
              )
            : h(
                Toggle,
                {
                  key: value,
                  id: value,
                  value: config.missingValues ? (value === 'one' ? undefined : '') : value,
                  disabled: value === 'two' && itemDisabled,
                  onPressedChange: ownChange,
                  onClick(event) {
                    if (config.consumerPrevent) event.preventBaseUIHandler();
                    if (config.consumerDefault) event.preventDefault();
                  },
                  className: (state) => (state.pressed ? 'toggle pressed' : 'toggle'),
                  style: (state) => ({ opacity: state.disabled ? 0.5 : 1 }),
                },
                value,
              ),
        ),
      );
    let children: React.ReactNode;
    if (config.grouped)
      children = [
        h(Toolbar.Button, { key: 'before', id: 'before' }, 'Before'),
        h(Toolbar.Group, { key: 'group', disabled: config.groupDisabled }, group()),
        h(Toolbar.Button, { key: 'after', id: 'after' }, 'After'),
      ];
    else if (config.input)
      children = [
        h(Toolbar.Button, { key: 'before', id: 'before' }, 'Before'),
        h(Toolbar.Input, {
          key: 'input',
          id: 'tested-input',
          type: config.checkbox ? 'checkbox' : 'text',
          defaultValue: config.checkbox ? undefined : 'abcd',
          disabled: inputDisabled,
          focusableWhenDisabled: focusable,
        }),
        h(Toolbar.Button, { key: 'after', id: 'after' }, 'After'),
      ];
    else if (config.nestedGroups)
      children = h(
        Toolbar.Group,
        { id: 'outer', disabled: true },
        h(Toolbar.Button, { id: 'outer-button' }, 'Outer'),
        h(Toolbar.Group, { id: 'inner' }, h(Toolbar.Button, { id: 'inner-button' }, 'Inner')),
      );
    else
      children = [
        h(
          Toolbar.Button,
          {
            key: 'one',
            id: 'one',
            disabled: scenario === 'toolbar-metadata' && itemDisabled,
            focusableWhenDisabled: focusable,
          },
          'One',
        ),
        h(Toolbar.Link, { key: 'link', id: 'link', href: '#navigation-target' }, 'Link'),
        h(
          Toolbar.Group,
          { key: 'group', id: 'toolbar-group', disabled: config.groupDisabled },
          h(
            Toolbar.Button,
            {
              id: 'two',
              disabled: itemDisabled,
              focusableWhenDisabled: focusable,
              nativeButton: !config.custom,
              render: config.custom ? h('span') : undefined,
              onClick: () => setClicks((n) => n + 1),
              onMouseMove: () => setHover((n) => n + 1),
              onKeyDown: () => setKeydowns((n) => n + 1),
            },
            'Two',
          ),
          h(Toolbar.Button, { id: 'three' }, 'Three'),
        ),
        h(Toolbar.Input, { key: 'input', id: 'tested-input', defaultValue: '' }),
        h(Toolbar.Separator, {
          key: 'separator',
          id: 'separator',
          ...(config.separatorOverride ? { orientation: 'horizontal' as const } : {}),
        }),
      ];
    return h(
      'main',
      { 'data-hydrated': true },
      h(
        DirectionProvider,
        { direction },
        h(
          'form',
          { id: 'navigation-form', onReset: () => setResets((n) => n + 1) },
          shown
            ? config.toolbar
              ? h(
                  Toolbar.Root,
                  {
                    id: 'toolbar',
                    orientation,
                    dir: direction,
                    disabled: config.rootDisabled,
                    loopFocus: config.loopFocus,
                  },
                  children,
                )
              : group()
            : null,
          h('button', { id: 'outside', type: 'button' }, 'Outside'),
          h('button', { type: 'reset' }, 'Reset native input'),
        ),
      ),
      button('Change multiple', () => setMultiple((value) => !value)),
      button('Change owner', () => setOwner((value) => (value?.[0] === 'one' ? ['two'] : ['one']))),
      button('Change disabled', () => setItemDisabled((value) => !value)),
      button('Enable input', () => setInputDisabled((value) => !value)),
      button('Change focusable', () => setFocusable((value) => !value)),
      button('Reorder items', () => setItems((value) => [...value].reverse())),
      button('Remove two', () => setItems((value) => value.filter((item) => item !== 'two'))),
      button('Toggle mount', () => setShown((value) => !value)),
      h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)),
      h(
        'output',
        { 'data-testid': 'input-events' },
        JSON.stringify({ clicks, hover, keydowns, resets }),
      ),
      h('div', { id: 'navigation-target' }, 'Navigation target'),
    );
  }
  const root = createRoot(host);
  flushSync(() => root.render(h(Fixture)));
  return () => root.unmount();
}
