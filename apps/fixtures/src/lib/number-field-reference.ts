// Actual pinned Base UI 1.8.0 source-family witness on React/ReactDOM 19.2.8 (MIT).
import { createElement as h, useEffect, useState, useRef, version as reactVersion } from 'react';
import { version as reactDomVersion } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { NumberField, type NumberFieldRootProps, type NumberFieldRootChangeEventDetails, type NumberFieldRootCommitEventDetails } from '@base-ui/react/number-field';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
export function mountNumberFieldReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const initial = scenario.includes('empty') ? undefined : scenario.includes('precision') ? 1.23456789 : scenario === 'percent' ? 0.12 : 2;
    const controlled = scenario.includes('controlled');
    const [owner, setOwner] = useState<number | null>(initial ?? null);
    const [hydrated, setHydrated] = useState(false);
    const [shown, setShown] = useState(true);
    const [replacement, setReplacement] = useState(scenario.includes('replacement'));
    const [traces, setTraces] = useState<unknown[]>([]);
    const [submissions, setSubmissions] = useState<unknown[]>([]);
    const rootRef = useRef<HTMLDivElement>(null), visibleRef = useRef<HTMLInputElement>(null), hiddenRef = useRef<HTMLInputElement>(null);
    const options: NumberFieldRootProps = {
      locale: scenario === 'currency' ? 'de-DE' : 'en-US', allowWheelScrub: true,
      ...(scenario.includes('bounds') || scenario.includes('outofrange') ? { min: 0, max: 5 } : {}),
      ...(scenario.includes('outofrange') ? { allowOutOfRange: true } : {}),
      ...(scenario.includes('negative') ? { min: -10, max: -3 } : {}),
      ...(scenario.includes('precision') ? { step: 0.1 } : {}),
      ...(scenario === 'snap' ? { min: 0.3, step: 0.2, snapOnStep: true } : {}),
      ...(scenario === 'currency' ? { format: { style: 'currency', currency: 'EUR' } } : {}),
      ...(scenario === 'percent' ? { format: { style: 'percent' } } : {}),
      ...(scenario.includes('readonly') ? { readOnly: true } : {}),
      ...(scenario.includes('disabled') ? { disabled: true } : {}),
      ...(scenario.includes('required') ? { required: true } : {}),
      ...(scenario === 'external-form' ? { form: 'external-number-form' } : {}),
    };
    function changed(value: number | null, details: NumberFieldRootChangeEventDetails) {
      setTraces(previous => [...previous, { kind: 'change', value, reason: details.reason, direction: details.direction, type: details.event.type }]);
      if (scenario.includes('cancel')) details.cancel();
      if (controlled && !scenario.includes('reject') && !details.isCanceled) setOwner(value);
    }
    function committed(value: number | null, details: NumberFieldRootCommitEventDetails) {
      setTraces(previous => [...previous, { kind: 'commit', value, reason: details.reason, type: details.event.type }]);
    }
    useEffect(() => setHydrated(true), []);
    return h('main', { 'data-hydrated': hydrated, 'data-renderer': `${reactVersion}/${reactDomVersion}` },
      h(Form, { id: 'number-form', validationMode: scenario === 'validation' ? 'onBlur' : 'onSubmit', onFormSubmit: values => setSubmissions(previous => [...previous, values]) },
        h(Field.Root, { name: 'amount', id: 'number-field', validate: scenario === 'validation' ? value => value === 7 ? 'Seven unavailable' : null : undefined },
          h(Field.Label, { id: 'amount-label' }, 'Amount'), h(Field.Description, { id: 'amount-description' }, 'A numeric amount'),
          shown && h(NumberField.Root, { id: 'amount-input', ...options, defaultValue: initial, value: controlled ? owner : undefined, onValueChange: changed, onValueCommitted: committed, inputRef: hiddenRef, ref: rootRef },
            h(NumberField.Group, { id: 'number-group' },
              h(NumberField.Decrement, { id: 'decrease' }, 'Decrease'),
              h(NumberField.Input, { ...{ 'data-testid': 'visible' }, ref: visibleRef, onChange: event => { if (scenario === 'prevent-input') event.preventBaseUIHandler(); }, onKeyDown: event => { if (scenario === 'prevent-key') event.preventBaseUIHandler(); }, render: replacement ? h('input', { 'data-replacement': 'true' }) : undefined }),
              h(NumberField.Increment, { id: 'increase' }, 'Increase')),
            h(NumberField.ScrubArea, { id: 'number-scrub', ...{ 'data-testid': 'scrub' } }, h(NumberField.ScrubAreaCursor, { id: 'number-cursor', ...{ 'data-testid': 'cursor' } }, 'Cursor'), 'Scrub')),
          h(Field.Error, { id: 'number-error' }),
          h(Field.Validity, { children: state => h('output', { id: 'validity' }, JSON.stringify(state)) })),
        h('button', { id: 'submit', type: 'submit' }, 'Submit'), h('button', { id: 'reset', type: 'reset' }, 'Reset')),
      h('form', { id: 'external-number-form' }), h('button', { id: 'outside' }, 'Outside'),
      h('button', { id: 'owner-update', onClick: () => setOwner(42) }, 'Owner update'),
      h('button', { id: 'replace-input', onClick: () => setReplacement(previous => !previous) }, 'Replace input'),
      h('button', { id: 'toggle-root', onClick: () => setShown(previous => !previous) }, 'Toggle root'),
      h('output', { id: 'number-traces' }, JSON.stringify(traces)), h('output', { id: 'number-submissions' }, JSON.stringify(submissions)),
      h('output', { id: 'ref-state' }, JSON.stringify({ root: rootRef.current?.isConnected ?? false, visible: visibleRef.current?.isConnected ?? false, hidden: hiddenRef.current?.isConnected ?? false })));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
