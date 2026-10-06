// Actual Base UI 1.8.0 / React+ReactDOM19.2.8 paired source witness. MIT.
import {
  createElement as h,
  useEffect,
  useState,
  useCallback,
  version as reactVersion,
} from 'react';
import { createRoot } from 'react-dom/client';
import { version as reactDomVersion } from 'react-dom';
import { Checkbox } from '@base-ui/react/checkbox';
import { Switch } from '@base-ui/react/switch';
import { CheckboxGroup } from '@base-ui/react/checkbox-group';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
export function mountBooleanReference(
  node: HTMLElement,
  family: 'switch' | 'checkbox',
  scenario: string,
) {
  function Fixture() {
    const [hydrated, setHydrated] = useState(false);
    const [checked, setChecked] = useState(false);
    const [groupValue, setGroupValue] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [visible, setVisible] = useState(true);
    const [calls, setCalls] = useState<unknown[]>([]);
    const [submissions, setSubmissions] = useState<unknown[]>([]);
    const [inputEvents, setInputEvents] = useState(0);
    const [cancelChanges, setCancelChanges] = useState(scenario === 'cancel');
    useEffect(() => {
      setHydrated(true);
    }, []);
    const controlled = scenario.startsWith('controlled');
    const native = scenario.startsWith('native');
    const required = scenario === 'required';
    const disabled = scenario === 'disabled';
    const readOnly = scenario === 'readonly';
    const cancelLate = useCallback((event: KeyboardEvent) => event.preventDefault(), []);
    useEffect(() => () => window.removeEventListener('keydown', cancelLate), []);
    const controlProps = {
      id: 'control-input',
      name: 'fallback',
      checked: controlled ? checked : undefined,
      defaultChecked: scenario === 'reset-true',
      required,
      disabled,
      readOnly,
      value: 'yes',
      uncheckedValue: 'no',
      nativeButton: native,
      render: native ? h('button') : undefined,
      'data-control': '',
      onCheckedChange(next: boolean, details: Switch.Root.ChangeEventDetails) {
        setCalls((previous) => [
          ...previous,
          { checked: next, type: details.event.type, reason: details.reason },
        ]);
        if (cancelChanges) details.cancel();
        if (!details.isCanceled && controlled && scenario !== 'controlled-reject') setChecked(next);
      },
    };
    const control =
      family === 'switch'
        ? h(
            Switch.Root,
            controlProps,
            h(Switch.Thumb, { className: undefined, ...{ 'data-part': '' } }),
          )
        : h(
            Checkbox.Root,
            controlProps,
            h(Checkbox.Indicator, { className: undefined, ...{ 'data-part': '' } }),
          );
    const button = (text: string, action: () => void) => h('button', { onClick: action }, text);
    return h(
      'main',
      {
        'data-hydrated': hydrated,
        'data-framework': 'react',
        'data-reference-react': reactVersion,
        'data-reference-react-dom': reactDomVersion,
      },
      h(
        Form,
        {
          id: 'form',
          errors,
          onInput: () => setInputEvents((count) => count + 1),
          onSubmit: (event) => event.preventDefault(),
          onFormSubmit: (values) => setSubmissions((previous) => [...previous, values]),
        },
        h(
          'div',
          {
            onKeyDown(event) {
              if (scenario.includes('ancestor-prevent')) event.preventDefault();
              if (scenario.includes('ancestor-stop')) event.stopPropagation();
            },
          },
          h(
            Field.Root,
            { id: 'field', name: 'enabled' },
            h(Field.Label, { id: 'label' }, 'Enabled'),
            visible ? control : null,
            h(Field.Description, { id: 'description' }, 'A boolean field'),
            h(Field.Error, { id: 'error' }),
          ),
        ),
        h('button', { type: 'submit', id: 'submit', name: 'intent', value: 'save' }, 'Submit'),
        h('button', { type: 'reset', id: 'reset' }, 'Reset'),
      ),
      scenario === 'group'
        ? h(
            Form,
            {
              id: 'group-form',
              onSubmit: (event) => event.preventDefault(),
              onFormSubmit: (values) => setSubmissions((previous) => [...previous, values]),
            },
            h(
              Field.Root,
              { name: 'choices' },
              h(Field.Label, { id: 'group-label' }, 'Choices'),
              h(
                CheckboxGroup,
                {
                  allValues: ['a', 'b'],
                  value: groupValue,
                  onValueChange(next, details) {
                    if (cancelChanges) details.cancel();
                    if (!details.isCanceled) setGroupValue(next);
                  },
                },
                h(Checkbox.Root, { parent: true, ...{ 'data-parent-control': '' } }),
                h(
                  Field.Item,
                  null,
                  h(Checkbox.Root, { value: 'a', ...{ 'data-child': 'a' } }),
                  h(Field.Label, null, 'A'),
                ),
                h(
                  Field.Item,
                  null,
                  h(Checkbox.Root, { value: 'b', ...{ 'data-child': 'b' } }),
                  h(Field.Label, null, 'B'),
                ),
              ),
            ),
            h('button', { type: 'submit', id: 'group-submit' }, 'Submit group'),
          )
        : null,
      button('Owner toggle', () => setChecked(!checked)),
      button('Server error', () => setErrors({ enabled: 'Server error' })),
      button('Unmount', () => setVisible(false)),
      button('Toggle cancellation', () => setCancelChanges(!cancelChanges)),
      button('Install late window cancellation', () =>
        window.addEventListener('keydown', cancelLate),
      ),
      h('output', { id: 'calls' }, JSON.stringify(calls)),
      h('output', { id: 'submissions' }, JSON.stringify(submissions)),
      h('output', { id: 'input-events' }, String(inputEvents)),
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
