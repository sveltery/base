// Actual Base UI v1.8.0 on React/ReactDOM 19.2.8; source closure in parity/button, MIT.
import {
  createElement as h,
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Button } from '@base-ui/react/button';
import { CompositeRoot } from '@base-ui/react/internals/composite';

export function ButtonSourceReference({ scenario = 'composite-custom' }: { scenario?: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(true);
  const [disabled, setDisabled] = useState(
    scenario === 'nested-disabled' || scenario === 'override-disabled',
  );
  const [calls, setCalls] = useState<string[]>([]);
  const [outerHost, setOuterHost] = useState<HTMLElement | null>(null);
  const [innerHost, setInnerHost] = useState<HTMLElement | null>(null);
  const outerRef = useCallback((host: HTMLElement | null) => {
    setOuterHost(host);
  }, []);
  const innerRef = useCallback((host: HTMLElement | null) => {
    setInnerHost(host);
  }, []);
  const native = [
    'composite-native',
    'composite-submit',
    'composite-reset',
    'override-disabled',
    'nested-disabled',
    'native-mismatch',
  ].includes(scenario);
  const composite = scenario !== 'shadow' && scenario !== 'props';
  const textNavigation = ['composite-menuitem', 'composite-option', 'composite-gridcell'].includes(
    scenario,
  );
  const role = textNavigation
    ? scenario.replace('composite-', '')
    : scenario === 'composite-switch'
      ? 'switch'
      : undefined;
  const record = (value: string) => setCalls((previous) => [...previous, value]);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const button = visible
    ? h(
        Button,
        {
          id: 'source-button',
          disabled,
          nativeButton: native,
          focusableWhenDisabled: disabled,
          tabIndex: 0,
          role,
          type:
            scenario === 'composite-submit'
              ? 'submit'
              : scenario === 'composite-reset'
                ? 'reset'
                : 'button',
          render: scenario.startsWith('nested-')
            ? h(Button, {
                nativeButton: native,
                focusableWhenDisabled: true,
                disabled,
                ref: innerRef,
                render: native ? undefined : h('span'),
              })
            : scenario === 'composite-link' || scenario === 'composite-menuitem'
              ? h('a', { href: '#source-target' })
              : scenario === 'override-disabled'
                ? h('button', { disabled: true })
                : native && scenario !== 'native-mismatch'
                  ? undefined
                  : h('span', { onClick: () => record('render-click') }),
          ref: outerRef,
          className: (state) => `source-class${state.disabled ? ' disabled' : ''}`,
          style: (state) => ({ opacity: state.disabled ? 0.5 : 1 }),
          onClick: () => record('click'),
          onKeyDown: (event: ReactKeyboardEvent & { preventBaseUIHandler(): void }) => {
            record('keydown');
            if (textNavigation || scenario === 'composite-switch') event.preventDefault();
            if (scenario === 'composite-cancel') event.preventBaseUIHandler();
          },
          onKeyUp: () => record('keyup'),
        },
        'Source action',
      )
    : null;
  useEffect(() => {
    if (scenario !== 'shadow' || !outerHost || outerHost.shadowRoot) return;
    const shadow = outerHost.attachShadow({ mode: 'open' });
    const inner = document.createElement('span');
    inner.tabIndex = 0;
    shadow.append(inner);
  }, [scenario, outerHost]);
  return h(
    'main',
    { 'data-hydrated': hydrated, 'data-framework': 'react' },
    h(
      'form',
      {
        onSubmit: (event) => {
          event.preventDefault();
          record('submit');
        },
        onReset: (event) => {
          event.preventDefault();
          record('reset');
        },
      },
      composite ? h(CompositeRoot, null, button) : button,
    ),
    h(
      'button',
      { id: 'remove-button', onClick: () => setVisible((previous) => !previous) },
      'Toggle host',
    ),
    h(
      'button',
      { id: 'enable-button', onClick: () => setDisabled((previous) => !previous) },
      'Toggle disabled',
    ),
    h('output', { 'data-testid': 'source-calls' }, JSON.stringify(calls)),
    h('output', { 'data-testid': 'source-ref' }, outerHost?.id ?? 'null'),
    h('output', { 'data-testid': 'source-inner-ref' }, innerHost?.id ?? 'null'),
    h('div', { id: 'source-target' }, 'Target'),
  );
}
export function hydrateButtonSourceReference(node: HTMLElement, scenario: string) {
  const root = hydrateRoot(node, h(ButtonSourceReference, { scenario }));
  return () => root.unmount();
}
