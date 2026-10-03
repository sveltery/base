// Actual pinned Base UI 1.8.0 source-family witness on React+ReactDOM19.2.8. MIT.
import {
  createElement as h,
  useEffect,
  useRef,
  useState,
  version as reactVersion,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { version as reactDomVersion } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Radio, type RadioRootProps } from '@base-ui/react/radio';
import { RadioGroup, type RadioGroupProps } from '@base-ui/react/radio-group';
import { Field } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';
import { Form } from '@base-ui/react/form';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { CompositeRoot } from '@base-ui/react/internals/composite';
const Group = RadioGroup<string | null>;
export function mountRadioReference(
  node: HTMLElement,
  scenario: string,
  focusProps: Pick<RadioGroupProps<string | null>, 'onFocus' | 'onBlur'> = {},
  renderOverride = false,
  radioFocusProps: Pick<RadioRootProps, 'onFocus'> = {},
) {
  function Fixture() {
    const initial = scenario.includes('empty') ? null : 'b';
    const controlled = scenario.startsWith('controlled');
    const cancel = scenario.includes('cancel');
    const disabled =
      scenario.includes('disabled') && !scenario.includes('first-disabled');
    const readOnly = scenario.includes('readonly');
    const required = scenario.includes('required');
    const disabledFirst = scenario.includes('first-disabled');
    const rtl = scenario.includes('rtl');
    const nativeButton = scenario.includes('native-button');
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);
    const [owner, setOwner] = useState(initial);
    const [items, setItems] = useState(['a', 'b', 'c']);
    const [calls, setCalls] = useState<unknown[]>([]);
    const [ancestorClicks, setAncestorClicks] = useState(0);
    const [submissions, setSubmissions] = useState<unknown[]>([]);
    const literalInput = useRef<HTMLInputElement>(null);
    const [literalCalls, setLiteralCalls] = useState(0);
    const [validationCalls, setValidationCalls] = useState(0);
    if (scenario.startsWith('standalone-')) {
      return h(
        'main',
        {
          'data-hydrated': hydrated,
          'data-renderer': `${reactVersion}/${reactDomVersion}`,
        },
        h(
          Field.Root,
          { id: 'standalone-field' },
          h(
            Radio.Root,
            {
              value: scenario === 'standalone-empty' ? '' : 'a',
              id: 'standalone-input',
              ...{ 'data-testid': 'standalone-radio' },
            },
            'Standalone',
          ),
        ),
        h(
          'section',
          { 'aria-label': 'Literal React radio baseline' },
          h(
            'button',
            {
              type: 'button',
              ...{ 'data-testid': 'literal-radio' },
              onClick(event: ReactMouseEvent<HTMLButtonElement>) {
                event.preventDefault();
                literalInput.current?.click();
              },
            },
            'Literal activation',
          ),
          h('input', {
            id: 'literal-input',
            ref: literalInput,
            type: 'radio',
            value: 'a',
            checked: false,
            hidden: true,
            onClick: (event) => event.stopPropagation(),
            onChange: () => setLiteralCalls((previous) => previous + 1),
          }),
          h('output', { id: 'literal-calls' }, literalCalls),
        ),
      );
    }
    return h(
      'main',
      {
        'data-hydrated': hydrated,
        'data-renderer': `${reactVersion}/${reactDomVersion}`,
      },
      h('form', { id: 'external-form' }),
      h(
        DirectionProvider,
        { direction: rtl ? 'rtl' : 'ltr' },
        h(
          Form,
          {
            id: 'form',
            onClick: () => setAncestorClicks((previous) => previous + 1),
            onFormSubmit: (values) =>
              setSubmissions((previous) => [...previous, values]),
          },
          h(
            Fieldset.Root,
            null,
            h(Fieldset.Legend, { id: 'legend' }, 'Legend'),
            h(
              Field.Root,
              {
                name: 'choice',
                id: 'field',
                validationMode: scenario.startsWith('onblur')
                  ? 'onBlur'
                  : undefined,
                validate: scenario.startsWith('onblur')
                  ? (value: unknown) => {
                      setValidationCalls((previous) => previous + 1);
                      return `Blur error: ${String(value)}`;
                    }
                  : undefined,
              },
              h(Field.Label, { id: 'group-label' }, 'Group'),
              h(Field.Description, { id: 'description' }, 'Description'),
              h(
                Group,
                {
                  id: 'radio-group',
                  defaultValue: initial,
                  value: controlled ? owner : undefined,
                  disabled,
                  readOnly,
                  required,
                  name: 'fallback',
                  form:
                    scenario === 'external-form' ? 'external-form' : undefined,
                  onValueChange(value, details) {
                    setCalls((previous) => [
                      ...previous,
                      {
                        value,
                        reason: details.reason,
                        type: details.event.type,
                        shiftKey: (details.event as MouseEvent).shiftKey,
                      },
                    ]);
                    if (cancel) details.cancel();
                    if (
                      controlled &&
                      !scenario.includes('reject') &&
                      !details.isCanceled
                    )
                      setOwner(value);
                  },
                  ...focusProps,
                  render: renderOverride ? h('section') : undefined,
                },
                items.map((value) =>
                  h(
                    Field.Item,
                    { key: value },
                    h(Field.Label, { id: `label-${value}` }, value),
                    h(
                      Radio.Root,
                      {
                        value,
                        id: `input-${value}`,
                        ...{ 'data-testid': `radio-${value}` },
                        nativeButton,
                        disabled: disabledFirst && value === 'a',
                        render: nativeButton ? h('button') : h('span'),
                        ...radioFocusProps,
                      },
                      h(Radio.Indicator, {
                        ...{ 'data-testid': `indicator-${value}` },
                        keepMounted: scenario.includes('keep'),
                      }),
                    ),
                  ),
                ),
              ),
              h(Field.Error, { id: 'error' }),
              h(Field.Validity, {
                children: (state) =>
                  h('output', { id: 'validity' }, JSON.stringify(state)),
              }),
            ),
          ),
          h('button', { type: 'submit', id: 'submit' }, 'Submit'),
          h('button', { type: 'reset', id: 'reset' }, 'Reset'),
        ),
      ),
      h('button', { onClick: () => setItems(['c', 'a', 'b']) }, 'Reorder'),
      h('button', { onClick: () => setItems(['a', 'c']) }, 'Remove selected'),
      h('button', { onClick: () => setItems([]) }, 'Remove all'),
      h('button', { onClick: () => setOwner('c') }, 'Programmatic'),
      h('output', { id: 'ancestor-clicks' }, ancestorClicks),
      h('output', { id: 'calls' }, JSON.stringify(calls)),
      h('output', { id: 'submissions' }, JSON.stringify(submissions)),
      h('output', { id: 'validation-calls' }, validationCalls),
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}

export function mountCompositeFocusReference(
  node: HTMLElement,
  renderOverride: boolean,
) {
  const root = createRoot(node);
  root.render(
    h(CompositeRoot, {
      props: [{ id: 'composite' }],
      render: renderOverride ? h('section') : undefined,
      children: h('input', {
        id: 'textbox',
        type: 'text',
        defaultValue: 'hello',
      }),
    }),
  );
  return () => root.unmount();
}
