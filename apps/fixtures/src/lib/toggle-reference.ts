// Pinned Base UI v1.8.0 Toggle fixtures. MIT: parity/toggle/UPSTREAM_LICENSE.
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toggle } from '@base-ui/react/toggle';
export function mountToggleReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const [ownerPressed, setOwner] = useState<boolean | undefined>(scenario.startsWith('controlled') || scenario === 'accept' ? false : undefined);
    const [defaultPressed, setDefault] = useState(scenario === 'default-true' || scenario === 'controlled-fallback');
    const [disabled, setDisabled] = useState(scenario === 'disabled' || scenario === 'custom-disabled');
    const [shown, setShown] = useState(true);
    const [calls, setCalls] = useState<{ pressed: boolean; reason: string; type: string; before: string | null; canceled: boolean; defaultPrevented: boolean; trigger: boolean }[]>([]);
    const [order, setOrder] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(0), [reset, setReset] = useState(0);
    const custom = ['custom', 'custom-disabled', 'render-cancel', 'render-order', 'descendant', 'link', 'controlled-render'].includes(scenario);
    const record = (entry: string) => setOrder(previous => [...previous, entry]);
    return h('main', { 'data-hydrated': 'true' },
      h('input', { type: 'checkbox', 'aria-label': 'Owner pressed', checked: ownerPressed ?? false, onChange: () => setOwner(!ownerPressed) }),
      h('button', { onClick: () => setOwner(undefined) }, 'Clear controlled prop'),
      h('button', { onClick: () => setDefault(!defaultPressed) }, 'Change default'),
      h('button', { onClick: () => setDisabled(!disabled) }, 'Change disabled'),
      h('button', { onClick: () => setShown(!shown) }, 'Toggle mounting'),
      h('div', { onClick: () => record('ancestor') },
        h('form', { id: 'toggle-form', onSubmit: event => { event.preventDefault(); setSubmitted(previous => previous + 1); }, onReset: () => setReset(previous => previous + 1) },
          h('input', { 'aria-label': 'Reset field', defaultValue: 'initial' }),
          shown ? h(Toggle, {
            id: 'tested-toggle', pressed: ownerPressed, defaultPressed, disabled, nativeButton: !custom && !scenario.startsWith('non-native'),
            ...(scenario === 'stripped-form' || scenario === 'non-native-stripped' ? { form: 'external-form', type: 'submit', value: 'sent', name: 'toggle' } : scenario === 'stripped-reset' ? { type: 'reset' } : {}),
            render: scenario === 'link' ? h('a', { href: '#target' }) : custom ? h('span', {
              onClick: (event: React.MouseEvent & { preventBaseUIHandler(): void }) => { record('render'); if (scenario === 'render-cancel') event.preventBaseUIHandler(); if (scenario === 'controlled-render') setOwner(true); },
            }) : undefined,
            className: state => state.pressed ? 'pressed-class' : 'unpressed-class', style: state => ({ opacity: state.disabled ? 0.5 : 1 }),
            onClick: event => { record('consumer'); if (scenario === 'click-cancel') event.preventBaseUIHandler(); if (scenario === 'click-default') event.preventDefault(); if (scenario === 'controlled-consumer') setOwner(true); },
            onPressedChange: (pressed, details) => {
              if (scenario === 'cancel') details.cancel();
              record('change');
              setCalls(previous => [...previous, { pressed, reason: details.reason, type: details.event.type,
                before: document.getElementById('tested-toggle')!.getAttribute('aria-pressed'), canceled: details.isCanceled,
                defaultPrevented: details.event.defaultPrevented, trigger: details.trigger !== undefined }]);
              if (scenario === 'accept' || scenario === 'controlled-consumer' || scenario === 'controlled-render') setOwner(pressed);
            },
          }, 'Toggle', scenario === 'descendant' ? h('input', { 'aria-label': 'Inner input' }) : null) : null,
          h('button', { type: 'reset' }, 'Native reset'))),
      h('form', { id: 'external-form' }),
      h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)),
      h('output', { 'data-testid': 'order' }, JSON.stringify(order)),
      h('output', { 'data-testid': 'forms' }, JSON.stringify({ submitted, reset })),
      h('div', { id: 'target' }, 'Link target'));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
