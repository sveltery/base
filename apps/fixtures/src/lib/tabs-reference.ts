// Actual Base UI 1.8.0 fixture on React/ReactDOM 19.2.8. Reference-only, MIT.
import {
  createElement as h,
  useEffect,
  useState,
  version as reactVersion,
} from 'react';
import { version as reactDomVersion } from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  Tabs,
  type TabsRootChangeEventDetails,
  type TabsTabValue,
} from '@base-ui/react/tabs';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { CSPProvider } from '@base-ui/react/csp-provider';
export function TabsReferenceFixture({
  scenario = 'default',
}: {
  scenario?: string;
}) {
  const implicit = scenario.includes('implicit') || scenario === 'all-disabled';
  const controlled = scenario.includes('controlled');
  const initial = scenario.includes('null')
    ? null
    : scenario.includes('missing')
      ? 99
      : scenario.includes('selected-last')
        ? 2
        : 0;
  const [values] = useState(() =>
    scenario.includes('objects')
      ? [{ key: 'a' }, { key: 'b' }, { key: 'c' }]
      : [0, 1, 2],
  );
  const [owner, setOwner] = useState<TabsTabValue>(
    initial === null ? null : (values[initial] ?? initial),
  );
  const [hydrated, setHydrated] = useState(false),
    [show, setShow] = useState(true),
    [items, setItems] = useState([0, 1, 2]);
  const [swapped, setSwapped] = useState(false),
    [wide, setWide] = useState(false),
    [duplicate, setDuplicate] = useState(false);
  const [dropOriginal, setDropOriginal] = useState(false);
  const [disabled, setDisabled] = useState(
    scenario.includes('disabled-first')
      ? [0]
      : scenario === 'all-disabled'
        ? [0, 1, 2]
        : scenario.includes('disabled-middle')
          ? [1]
          : [],
  );
  const [calls, setCalls] = useState<unknown[]>([]),
    [events, setEvents] = useState<string[]>([]);
  const keep = scenario.includes('keep'),
    activation = scenario.includes('activate'),
    flow = scenario.includes('vertical') ? 'vertical' : 'horizontal';
  useEffect(() => setHydrated(true), []);
  function change(next: TabsTabValue, details: TabsRootChangeEventDetails) {
    if (scenario.includes('cancel')) details.cancel();
    setCalls((previous) => [
      ...previous,
      {
        value: next,
        reason: details.reason,
        direction: details.activationDirection,
        type: details.event.type,
        canceled: details.isCanceled,
      },
    ]);
    if (!scenario.includes('reject') && !details.isCanceled) setOwner(next);
  }
  function consumer(event: {
    type: string;
    preventBaseUIHandler(): void;
    preventDefault(): void;
  }) {
    setEvents((previous) => [...previous, event.type]);
    if (scenario.includes('prevent-handler')) event.preventBaseUIHandler();
    if (scenario.includes('prevent-default')) event.preventDefault();
  }
  const tab = (index: number) =>
    h(
      'div',
      {
        key: index,
        className: 'tab-wrapper',
        style: scenario.includes('inner-scroll')
          ? { width: 110, overflow: 'auto' }
          : undefined,
      },
      h(
        Tabs.Tab,
        {
          value: values[index],
          id: `tab-${index}`,
          ...{ 'data-testid': `tab-${index}` },
          disabled: disabled.includes(index),
          style:
            index === 0 && wide
              ? { width: 155 }
              : index === 2 && scenario.includes('translate-percent')
                ? { translate: '10% 20%' }
                : index === 2 && scenario.includes('translate-longhand')
                  ? { translate: '12px 8px' }
                  : index === 2 && scenario.includes('translate')
                    ? { transform: 'translate(12px,8px)' }
                    : undefined,
          nativeButton:
            !scenario.includes('custom') &&
            !scenario.includes('caret') &&
            !(swapped && index === 1),
          onClick: scenario.includes('prevent') ? consumer : undefined,
          onFocus: scenario.includes('prevent-focus') ? consumer : undefined,
          autoFocus: scenario.includes('autofocus') && index === 2,
          render:
            scenario.includes('custom') ||
            scenario.includes('caret') ||
            (swapped && index === 1)
              ? h('div', { className: 'tabs-tab' })
              : h('button', { className: 'tabs-tab' }),
        },
        `Tab ${index}`,
        scenario.includes('caret')
          ? h('input', {
              'aria-label': `Textbox ${index}`,
              defaultValue: 'text',
            })
          : null,
      ),
    );
  const button = (id: string, text: string, action?: () => void) =>
    h('button', { id, onClick: action }, text);
  return h(
    'main',
    {
      'data-hydrated': hydrated,
      'data-renderer': `${reactVersion}/${reactDomVersion}`,
    },
    button('before', 'Before'),
    button('external', 'External last', () => setOwner(values[2])),
    button('external-null', 'External null', () => setOwner(null)),
    button('disable', 'Disable selected', () =>
      setDisabled([
        Number(
          document
            .querySelector('[aria-selected=true]')
            ?.getAttribute('data-testid')
            ?.replace('tab-', '') ?? 0,
        ),
      ]),
    ),
    button('enable', 'Enable all', () => setDisabled([])),
    button('remove', 'Remove selected', () =>
      setItems((previous) =>
        previous.filter((index) => values[index] !== owner),
      ),
    ),
    button('clear', 'Remove all', () => setItems([])),
    button('insert', 'Restore', () => setItems([0, 1, 2])),
    button('reorder', 'Reverse', () =>
      setItems((previous) => [...previous].reverse()),
    ),
    button('swap', 'Swap tab host', () => setSwapped((previous) => !previous)),
    button('resize', 'Resize', () => setWide((previous) => !previous)),
    button('duplicate', 'Duplicate panel', () =>
      setDuplicate((previous) => !previous),
    ),
    button('drop-original', 'Toggle original panel', () =>
      setDropOriginal((previous) => !previous),
    ),
    button('unmount', 'Toggle tree', () => setShow((previous) => !previous)),
    h(
      DirectionProvider,
      { direction: scenario.includes('rtl') ? 'rtl' : 'ltr' },
      h(
        CSPProvider,
        { nonce: 'tabs-nonce' },
        show
          ? h(
              Tabs.Root,
              {
                value: controlled ? owner : undefined,
                defaultValue: implicit
                  ? undefined
                  : initial === null
                    ? null
                    : (values[initial] ?? initial),
                orientation: flow,
                onValueChange: change,
                id: 'tabs-root',
              },
              h(
                Tabs.List,
                {
                  id: 'tabs-list',
                  className: 'tabs-list',
                  style: wide ? { width: 560 } : undefined,
                  activateOnFocus: activation,
                  loopFocus: !scenario.includes('no-loop'),
                  'aria-label': 'Example tabs',
                },
                ...items.map(tab),
                h(Tabs.Indicator, {
                  ...{ 'data-testid': 'indicator' },
                  className: 'tabs-indicator',
                  renderBeforeHydration: scenario.includes('prehydrate'),
                  render: (props, state) =>
                    h('span', {
                      ...props,
                      'data-position': JSON.stringify(state.activeTabPosition),
                      'data-size': JSON.stringify(state.activeTabSize),
                    }),
                }),
                scenario.includes('multiple-indicators')
                  ? h(Tabs.Indicator, {
                      ...{ 'data-testid': 'indicator-two' },
                      className: 'tabs-indicator',
                    })
                  : null,
              ),
              ...items
                .filter((index) => index !== 0 || !dropOriginal)
                .map((index) =>
                  h(
                    Tabs.Panel,
                    {
                      key: index,
                      value: values[index],
                      ...{ 'data-testid': `panel-${index}` },
                      keepMounted: keep,
                      style: scenario.includes('transition')
                        ? { transition: 'opacity 800ms', opacity: 1 }
                        : undefined,
                    },
                    `Panel ${index}`,
                    h('input', {
                      'aria-label': `Panel field ${index}`,
                      defaultValue: `seed ${index}`,
                    }),
                  ),
                ),
              duplicate
                ? h(
                    Tabs.Panel,
                    {
                      key: 'duplicate',
                      value: values[0],
                      keepMounted: true,
                      ...{ 'data-testid': 'duplicate-panel' },
                    },
                    'Duplicate',
                  )
                : null,
            )
          : null,
      ),
    ),
    button('after', 'After'),
    h('output', { id: 'calls' }, JSON.stringify(calls)),
    h('output', { id: 'events' }, JSON.stringify(events)),
    h('output', { id: 'owner' }, JSON.stringify(owner)),
  );
}
export function mountTabsReference(node: HTMLElement, scenario: string) {
  const root = createRoot(node);
  root.render(h(TabsReferenceFixture, { scenario }));
  return () => root.unmount();
}

// JSDOM Source-reference settlement; never imported by library runtime.
export { act } from 'react';
