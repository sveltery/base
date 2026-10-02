// Actual Base UI 1.8.0 characterization. MIT: parity/input/UPSTREAM_LICENSE.
import { createElement as h, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Input } from '@base-ui/react/input';
export function mountInputCheckedReference(target: HTMLElement, scenario: string) {
  function Fixture() {
    const radio = scenario.startsWith('radio');
    const controlled = !scenario.startsWith('checkbox-uncontrolled') && !scenario.startsWith('radio-uncontrolled');
    const [checked, setChecked] = useState(scenario.endsWith('-on'));
    const [first, setFirst] = useState(true);
    const [seed, setSeed] = useState(!scenario.includes('default-off'));
    const [alternate, setAlternate] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [calls, setCalls] = useState<Record<string, unknown>[]>([]);
    const [order, setOrder] = useState<string[]>([]);
    // Reactive bookkeeping would rerender every React input and obscure the final-group query.
    const append = (item: string) => { if (!scenario.includes('reassociate')) setOrder(previous => [...previous, item]); };
    useEffect(() => { setHydrated(true); }, []);
    return h('main', { 'data-hydrated': hydrated },
      h(scenario.includes('no-form') ? 'div' : 'form', { 'data-testid': 'form', onReset: event => { if (scenario.includes('cancel-reset')) event.preventDefault(); } },
        radio ? h('div', null, h(Input, { type: 'radio', name: 'choice', value: 'first', ...(scenario.includes('first-uncontrolled') ? { defaultChecked: true } : { checked: first }), ...{ 'data-testid': 'first' } })) : null,
        h(Input, {
          type: radio ? 'radio' : 'checkbox', name: radio ? 'choice' : 'check', ...(scenario.includes('no-value') ? {} : { value: 'token' }), ...{ 'data-testid': 'input' },
          ...(controlled ? { checked } : {}),
          ...(scenario.includes('default') ? { defaultChecked: seed } : {}),
          onClick: event => { if (scenario.includes('cancel-click')) event.preventDefault(); },
          onChange: event => { append('consumer'); if (scenario.includes('prevent-base')) event.preventBaseUIHandler(); if (scenario.includes('prevent-default')) event.preventDefault(); if (scenario.includes('reset-in-input')) event.currentTarget.form?.reset(); if (scenario.includes('reassociate')) event.currentTarget.setAttribute('form', 'other-form'); },
          onValueChange: (value, details) => {
            append('value'); const next = (details.event.target as HTMLInputElement).checked;
            if (scenario.includes('cancel-change')) details.cancel();
            if (scenario.includes('accept')) { setChecked(next); if (radio) setFirst(!next); }
            if (scenario.includes('rewrite')) { setChecked(!next); if (radio) setFirst(next); }
            if (!scenario.includes('reassociate')) setCalls(previous => [...previous, { value, checked: next, reason: details.reason, type: details.event.type, canceled: details.isCanceled, defaultPrevented: details.event.defaultPrevented, trusted: details.event.isTrusted }]);
          },
          render: props => h('input', { ...props, key: alternate ? 'replacement' : 'initial', 'data-host': alternate ? 'replacement' : 'initial', onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            append('render'); props.onChange?.(event);
            if (scenario.includes('after-props-read')) { setChecked(event.currentTarget.checked); setFirst(!event.currentTarget.checked); }
            if (scenario.includes('after-props-read') || scenario.includes('replacement-stop')) append('after');
            if (scenario.includes('stop-immediate')) event.nativeEvent.stopImmediatePropagation();
            else if (scenario.includes('stop-propagation')) event.stopPropagation();
          } }),
        }), h('button', { type: 'reset' }, 'Reset')),
      h('form', { id: 'other-form', 'data-testid': 'other-form' }, h(Input, { type: 'radio', name: 'choice', value: 'other', checked: true, ...{ 'data-testid': 'other' } })),
      h('button', { onClick: () => { setChecked(!checked); if (radio) setFirst(checked); } }, 'Programmatic'),
      h('button', { onClick: () => setSeed(!seed) }, 'Defaults'),
      h('button', { onClick: () => setAlternate(!alternate) }, 'Replace'),
      h('output', { 'data-testid': 'owner' }, JSON.stringify({ checked, first })),
      h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)), h('output', { 'data-testid': 'order' }, JSON.stringify(order)));
  }
  const root = createRoot(target); root.render(h(Fixture)); return () => root.unmount();
}
