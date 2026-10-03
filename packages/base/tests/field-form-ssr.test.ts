// Supplemental SSR boundaries; MIT: parity/field-form/UPSTREAM_LICENSE.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from './dom/FieldFormFixture.svelte';
import { Field } from '../src/lib/field/index.js';
import { Form } from '../src/lib/form/index.js';
import { Fieldset } from '../src/lib/fieldset/index.js';
it('SSR preserves label/control fallback relationships while omitting effect-registered messages and legend', () => {
  const { body } = render(Fixture, { props: { initial: 'server' } });
  const inputId = body.match(/<input\b[^>]*\sid="([^"]+)"/)?.[1];
  expect(inputId).toMatch(/^base-ui-/); expect(body).toContain(`for="${inputId}"`);
  expect(body).toContain('value="server"'); expect(body).toContain('aria-describedby="external"');
  expect(body).not.toContain('aria-labelledby'); expect(body).not.toContain('aria-invalid');
  expect(body).toContain('id="description"'); expect(body).toContain('id="legend"');
  expect(body).toContain('novalidate'); expect(body).not.toContain('id="error"');
});
it('SSR external errors retain invalid controls and default Error content without registering its description', () => {
  const { body } = render(Fixture, { props: { initialErrors: { email: ['one', 'two'] } } });
  expect(body).toContain('aria-invalid="true"'); expect(body).toContain('data-invalid=""');
  expect(body).toContain('id="error"'); expect(body).toContain('<li>one</li>'); expect(body).toContain('<li>two</li>');
  expect(body).toContain('aria-describedby="external"'); expect(body).not.toContain('data-starting-style');
});
it('SSR supports generic Form native attributes and context-free Field.Control', () => {
  expect(render(Form, { props: { id: 'form', method: 'post', action: '/submit', noValidate: false } }).body).toContain('method="post"');
  expect(render(Form, { props: { noValidate: false } }).body).not.toContain('novalidate');
  expect(render(Field.Control, { props: { defaultValue: 'standalone', name: 'text' } }).body).toContain('value="standalone"');
});
it('SSR Fieldset supports disabled native semantics and required Legend context errors', () => {
  const { body } = render(Fieldset.Root, { props: { disabled: true, id: 'group' } });
  expect(body).toContain('<fieldset'); expect(body).toContain('disabled'); expect(body).toContain('data-disabled=""');
  expect(() => render(Fieldset.Legend).body).toThrow('FieldsetRootContext is missing');
  for (const Component of [Field.Label, Field.Description, Field.Error, Field.Item]) expect(() => render(Component).body).toThrow('FieldRootContext is missing');
});
