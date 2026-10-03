// Actual pinned Base UI 1.8.0 source-family witness on React+ReactDOM19.2.8. MIT.
import {
  createElement as h,
  useEffect,
  useState,
  version as reactVersion,
} from 'react';
import { version as reactDomVersion } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Field } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';
import { Form } from '@base-ui/react/form';
import { DirectionProvider } from '@base-ui/react/direction-provider';
const Group = RadioGroup<string | null>;
export function mountRadioReference(node: HTMLElement, scenario: string) {
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
              { name: 'choice', id: 'field' },
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
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
