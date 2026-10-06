// Independent Base UI 1.8.0 regression supplements; MIT: parity/input/UPSTREAM_LICENSE.
import { createElement as h, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { Input } from '@base-ui/react/input';
export function mountInputCheckedConsumerReference(
  target: HTMLElement,
  initial: boolean,
  controlled: boolean,
  mode: string,
  observations: string[],
  type: 'checkbox' | 'radio' = 'checkbox',
) {
  const root = createRoot(target);
  const props: ComponentProps<typeof Input> & { 'data-testid': string } = {
    type,
    name: type === 'radio' ? 'choice' : undefined,
    'data-testid': 'owned',
    value: 'token',
    ...(controlled ? { checked: initial } : { defaultChecked: initial }),
    onChange(event) {
      const input = event.currentTarget;
      observations.push(`consumer:${input.checked}`);
      if (mode === 'reset') input.form!.reset();
      else {
        input.checked = initial;
        if (mode === 'nested-input') input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    onValueChange(_value, details) {
      observations.push(`value:${(details.event.target as HTMLInputElement).checked}`);
    },
  };
  root.render(
    h(
      'form',
      null,
      type === 'radio'
        ? h('input', {
            type: 'radio',
            name: 'choice',
            defaultChecked: true,
            'data-testid': 'sibling',
          })
        : null,
      h(Input, props),
    ),
  );
  return () => root.unmount();
}
