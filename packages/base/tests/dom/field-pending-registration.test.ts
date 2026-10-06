// Authored async baseline fidelity regression; zero unchanged upstream assertion credit.
import { expect, it } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import type { FieldRootActions } from '../../src/lib/field/types.js';
import Fixture from './FieldPendingRegistrationFixture.svelte';

it('pending validation retains its invocation baseline when the first control registers', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  let resolve!: (value: null) => void;
  const values: unknown[] = [];
  const actionsRef = { current: null as FieldRootActions | null };
  const component = mount(Fixture, {
    target: host,
    props: {
      actionsRef,
      validate(value) {
        values.push(value);
        return new Promise<null>((done) => (resolve = done));
      },
    },
  });
  flushSync();
  try {
    actionsRef.current!.validate();
    flushSync();
    host.querySelector('button')!.click();
    flushSync();
    expect(host.querySelector('output')!.textContent).toBe('"first baseline"');
    resolve(null);
    await new Promise((done) => setTimeout(done, 0));
    flushSync();
    expect(values).toEqual([null]);
    expect(host.querySelector('output')!.textContent).toBe('null');
  } finally {
    await unmount(component);
    host.remove();
  }
});
