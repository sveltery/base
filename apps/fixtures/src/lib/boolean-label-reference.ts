// Actual Base UI1.8 / React+ReactDOM19.2.8 native-label witnesses. MIT.
import { createElement as h, version as reactVersion } from 'react';
import { createRoot } from 'react-dom/client';
import { version as reactDomVersion } from 'react-dom';
import { Checkbox } from '@base-ui/react/checkbox';
import { Switch } from '@base-ui/react/switch';

export interface BooleanLabelState {
  present: boolean;
  id: string;
  htmlFor: string;
}

export function mountBooleanLabelReference(
  target: HTMLElement | ShadowRoot,
  family: 'checkbox' | 'switch',
  initial: BooleanLabelState,
) {
  const root = createRoot(target);
  function setLabel(label: BooleanLabelState) {
    const controlProps = { id: 'label-control', 'data-control': '' };
    const control =
      family === 'checkbox'
        ? h(Checkbox.Root, controlProps)
        : h(Switch.Root, controlProps);
    root.render(
      h(
        'main',
        {
          'data-hydrated': 'true',
          'data-reference-react': reactVersion,
          'data-reference-react-dom': reactDomVersion,
        },
        control,
        h('span', { 'data-gap': '' }),
        label.present
          ? h('label', { id: label.id, htmlFor: label.htmlFor }, 'Native label')
          : null,
      ),
    );
  }
  setLabel(initial);
  return { setLabel, dispose: () => root.unmount() };
}
