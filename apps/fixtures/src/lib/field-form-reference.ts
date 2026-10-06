// Actual @base-ui/react 1.8.0 reference; immutable source pin 47b40521; MIT: parity/field-form/UPSTREAM_LICENSE.
import { createElement as h, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Fieldset } from '@base-ui/react/fieldset';
import { Input } from '@base-ui/react/input';
export function mountFieldFormReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const controlled = scenario.startsWith('controlled');
    const mode = scenario.includes('onChange')
      ? 'onChange'
      : scenario.includes('onBlur')
        ? 'onBlur'
        : 'onSubmit';
    const custom =
      scenario.includes('custom') || scenario.includes('async') || scenario.includes('debounce');
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);
    const [value, setValue] = useState(controlled ? 'seed' : '');
    const [secondValue, setSecondValue] = useState('second');
    const [disabled, setDisabled] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | string[]>>();
    const [id, setId] = useState<string | undefined>('control-a');
    const [name, setName] = useState<string | undefined>('email');
    const [description, setDescription] = useState(true);
    const [control, setControl] = useState(true);
    const [textarea, setTextarea] = useState(scenario.includes('replacement'));
    const [secondFirst, setSecondFirst] = useState(false);
    const [externalForm, setExternalForm] = useState<string>();
    const [calls, setCalls] = useState<unknown[]>([]),
      [submissions, setSubmissions] = useState<unknown[]>([]),
      [validations, setValidations] = useState<unknown[]>([]);
    const fieldActions = useRef<Field.Root.Actions | null>(null),
      formActions = useRef<Form.Actions | null>(null);
    const validate: NonNullable<Field.Root.Props['validate']> = (value, values) => {
      setValidations((previous) => [...previous, { value, values }]);
      const result = scenario.includes('duplicates')
        ? ['same', 'same']
        : value === 'valid' || value === 'second'
          ? null
          : 'custom error';
      return scenario.includes('async')
        ? new Promise((resolve) => setTimeout(() => resolve(result), value === 'slow' ? 180 : 30))
        : result;
    };
    const Control = scenario.includes('input') ? Input : Field.Control;
    const first = h(
      Field.Root,
      {
        id: 'field',
        name,
        validate: custom ? validate : undefined,
        validationDebounceTime: scenario.includes('debounce') ? 80 : 0,
        actionsRef: fieldActions,
      },
      h(Field.Label, { id: 'field-label' }, 'Email'),
      description ? h(Field.Description, { id: 'description' }, 'Description') : null,
      control
        ? h(Control, {
            id,
            name: 'fallback',
            value: controlled ? value : undefined,
            defaultValue: controlled ? 'seed' : '',
            required: true,
            type: scenario === 'email' ? 'email' : 'text',
            form: externalForm,
            'aria-describedby': 'external external',
            render: textarea ? h('textarea') : undefined,
            onValueChange(next, details) {
              setCalls((previous) => [
                ...previous,
                { value: next, reason: details.reason, type: details.event.type },
              ]);
              if (scenario.includes('accept')) setValue(next);
              else if (scenario.includes('rewrite')) setValue(next.toUpperCase());
            },
          })
        : null,
      h(Field.Error, { id: 'error' }),
      h(Field.Validity, {
        children: (state) => h('output', { id: 'validity' }, JSON.stringify(state)),
      }),
    );
    const second =
      scenario === 'two-fields'
        ? h(
            Field.Root,
            { id: 'second-field', name: 'second' },
            h(Field.Label, null, 'Second'),
            h(Field.Control, {
              id: 'second-control',
              value: secondValue,
              required: true,
              onValueChange: (next) => setSecondValue(next),
            }),
            h(Field.Error, { id: 'second-error' }),
          )
        : null;
    const button = (label: string, action: () => void) => h('button', { onClick: action }, label);
    return h(
      'main',
      { 'data-hydrated': hydrated },
      h(
        Form,
        {
          id: 'form',
          validationMode: mode,
          errors,
          actionsRef: formActions,
          onSubmit(event) {
            event.preventDefault();
            setSubmissions((previous) => [...previous, 'native']);
          },
          onFormSubmit(values, details) {
            setSubmissions((previous) => [...previous, { values, reason: details.reason }]);
          },
        },
        h(
          Fieldset.Root,
          { id: 'fieldset', disabled },
          h(Fieldset.Legend, { id: 'legend' }, 'Account'),
          secondFirst ? second : null,
          first,
          secondFirst ? null : second,
        ),
        h('button', { type: 'submit', id: 'submit' }, 'Submit'),
        h('button', { type: 'reset', id: 'reset' }, 'Reset'),
      ),
      h('form', { id: 'other-form' }),
      button('Programmatic', () => setValue('programmatic')),
      button('Disable', () => setDisabled(true)),
      button('Enable', () => setDisabled(false)),
      button('Server errors', () => setErrors({ email: 'server error' })),
      button('Empty errors', () => setErrors({ email: [] })),
      button('Server duplicates', () => setErrors({ email: ['duplicate', 'duplicate'] })),
      button('Change id', () => setId('control-b')),
      button('Remove id', () => setId(undefined)),
      button('Rename', () => setName(undefined)),
      button('Empty id', () => setId('')),
      button('Hide description', () => setDescription(false)),
      button('Remove control', () => setControl(false)),
      button('Show control', () => setControl(true)),
      button('Textarea', () => setTextarea(true)),
      button('Reorder', () => setSecondFirst(true)),
      button('Reassociate', () => setExternalForm('other-form')),
      button('Validate form', () => formActions.current?.validate()),
      button('Validate field', () => fieldActions.current?.validate()),
      h('output', { id: 'calls' }, JSON.stringify(calls)),
      h('output', { id: 'submissions' }, JSON.stringify(submissions)),
      h('output', { id: 'validations' }, JSON.stringify(validations)),
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
