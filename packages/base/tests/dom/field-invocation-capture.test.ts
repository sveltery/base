// Authored native regression for the measured pinned invocation contract; no upstream assertion credit.
import { expect, it } from 'vitest';
import { flushSync, mount, unmount, type ComponentProps } from 'svelte';
import type { FieldRootActions } from '../../src/lib/field/types.js';
import Fixture from './FieldFormInvocationCaptureFixture.svelte';

it.each([false, true])(
  'async publication retains invocation invalid=%s',
  async (initialInvalid) => {
    const host = document.createElement('div');
    document.body.append(host);
    const actionsRef = { current: null as FieldRootActions | null };
    let contexts!: Parameters<ComponentProps<typeof Fixture>['capture']>[0];
    let resolve!: (value: null) => void;
    const component = mount(Fixture, {
      target: host,
      props: {
        initialInvalid,
        actionsRef,
        validate: () => new Promise<null>((done) => (resolve = done)),
        capture: (value) => (contexts = value),
        submit: () => {},
      },
    });
    flushSync();
    const fields = contexts!.form.formRef.current.fields;
    const original = fields.set;
    const published: (boolean | null)[] = [];
    fields.set = function (id, field) {
      published.push(field.validityData.state.valid);
      return original.call(this, id, field);
    };
    try {
      actionsRef.current!.validate();
      flushSync();
      expect(typeof resolve).toBe('function');
      component.update(!initialInvalid, 'before');
      flushSync();
      expect(host.querySelector('input')!.getAttribute('aria-invalid')).toBe(
        initialInvalid ? null : 'true',
      );
      published.length = 0;
      resolve(null);
      await new Promise((done) => setTimeout(done, 0));
      flushSync();
      expect(published[0]).toBe(!initialInvalid);
      expect(published.at(-1)).toBe(initialInvalid);
      expect(host.querySelector('output')!.textContent).toBe(
        JSON.stringify({ valid: initialInvalid, error: '' }),
      );
    } finally {
      fields.set = original;
      await unmount(component);
      host.remove();
    }
  },
);
