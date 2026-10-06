// MIT Base UI 1.8.0, immutable 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// Public paired supplements, not unchanged Original assertion ports.
import { createElement as h, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  NumberField,
  type NumberFieldRootChangeEventDetails,
  type NumberFieldRootCommitEventDetails,
} from '@base-ui/react/number-field';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
export function mountNumberFieldSourceBugReference(node: HTMLElement, mode: string) {
  function Fixture() {
    const initial = mode === 'cancel' ? 0 : 2;
    const [owner, setOwner] = useState<number | null>(initial);
    const [ready, setReady] = useState(false);
    // Logging must not rerender Root: pin Increment L703 uses a nonreactive vi.fn observer.
    const traces = useRef<unknown[]>([]);
    const validation = useRef<unknown[]>([]);
    const traceOutput = useRef<HTMLOutputElement>(null);
    const validationOutput = useRef<HTMLOutputElement>(null);
    const publishTraces = () => {
      if (traceOutput.current) traceOutput.current.textContent = JSON.stringify(traces.current);
    };
    const publishValidation = () => {
      if (validationOutput.current)
        validationOutput.current.textContent = JSON.stringify(validation.current);
    };
    useEffect(() => setReady(true), []);
    function changed(value: number | null, details: NumberFieldRootChangeEventDetails) {
      traces.current.push({ kind: 'change', value, reason: details.reason });
      publishTraces();
      if (mode === 'cancel' || (mode === 'validation' && details.reason === 'none'))
        details.cancel();
      if (!details.isCanceled && mode !== 'cancel' && mode !== 'decline') setOwner(value);
    }
    function committed(value: number | null, details: NumberFieldRootCommitEventDetails) {
      traces.current.push({ kind: 'commit', value, reason: details.reason });
      publishTraces();
    }
    function validate(value: unknown) {
      validation.current.push({ value });
      publishValidation();
      return null;
    }
    return h(
      'main',
      { 'data-hydrated': ready, 'data-framework': 'react' },
      h(
        Form,
        { validationMode: mode === 'validation' ? 'onChange' : 'onSubmit' },
        h(
          Field.Root,
          { name: 'amount', validate: mode === 'validation' ? validate : undefined },
          h(
            NumberField.Root,
            {
              defaultValue: initial,
              value: mode === 'cancel' ? undefined : owner,
              step: 'any',
              allowWheelScrub: true,
              onValueChange: changed,
              onValueCommitted: committed,
            },
            h(NumberField.Input, { ...{ 'data-testid': 'visible' } }),
            h(NumberField.Increment, { id: 'increase' }, 'Increase'),
            h(NumberField.ScrubArea, { ...{ 'data-testid': 'scrub' } }, 'Scrub'),
          ),
        ),
      ),
      h('button', { id: 'owner-update', onClick: () => setOwner(42) }, 'Owner42'),
      h(
        'button',
        {
          id: 'clear-validation',
          onClick: () => {
            validation.current = [];
            publishValidation();
          },
        },
        'Clear',
      ),
      h('output', { id: 'number-traces', ref: traceOutput }, '[]'),
      h('output', { id: 'number-validation-calls', ref: validationOutput }, '[]'),
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
