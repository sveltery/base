// Exact Base UI 1.8.0 + React 19.3.0 ownership comparator; MIT: parity/field-form/.
import { createElement as h, act } from 'react';
import { createRoot } from 'react-dom/client';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
export function createErrorOwnershipReference(host: HTMLElement) {
  const root = createRoot(host);
  return {
    async update(messages: string[], override: 'default' | 'children' | 'render' | 'empty' = 'default') {
      await act(() => root.render(h(Form, { errors: { email: messages } }, h(Field.Root, { name: 'email' }, h(Field.Control, { id: 'control' }),
        h(Field.Error, { id: 'error', ...(override === 'children' ? { children: h('strong', null, 'Custom error content') } : override === 'empty' ? { children: undefined } : {}), ...(override === 'render' ? { render: h('p', null, 'Custom rendered error') } : {}) })))));
    },
    async unmount() { await act(() => root.unmount()); },
  };
}
