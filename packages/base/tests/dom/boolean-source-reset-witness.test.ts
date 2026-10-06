// Actual Base UI1.8.0, React/DOM19.2.8 witnesses. Supplemental assertions, zero ordinary credit.
import { afterEach, expect, it, vi } from 'vitest';
import { mountBooleanReference } from '../../../../apps/fixtures/src/lib/boolean-controls-reference.js';
const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0)) dispose();
  document.body.replaceChildren();
});
async function render(family: 'checkbox' | 'switch', scenario: string) {
  const host = document.createElement('div');
  document.body.append(host);
  cleanup.push(mountBooleanReference(host, family, scenario));
  await vi.waitFor(() =>
    expect(host.querySelector('main')?.getAttribute('data-hydrated')).toBe('true'),
  );
  const main = host.querySelector('main')!;
  expect(main.getAttribute('data-reference-react')).toBe('19.2.8');
  expect(main.getAttribute('data-reference-react-dom')).toBe('19.2.8');
  return {
    host,
    root: host.querySelector<HTMLElement>('[data-control]')!,
    input: host.querySelector<HTMLInputElement>('#form input[type="checkbox"]')!,
    form: host.querySelector<HTMLFormElement>('#form')!,
  };
}
for (const family of ['checkbox', 'switch'] as const) {
  it(`${family} actual React state remains checked after native reset`, async () => {
    const view = await render(family, 'default');
    view.root.click();
    await vi.waitFor(() => expect(view.root.getAttribute('aria-checked')).toBe('true'));
    expect(view.input.checked).toBe(true);
    expect(view.input.defaultChecked).toBe(false);
    view.form.reset();
    expect(view.input.checked).toBe(false);
    expect(view.root.getAttribute('aria-checked')).toBe('true');
    expect(Array.from(new FormData(view.form).entries())).toEqual([]);
  });
  it(`${family} actual React restores a rejected controlled activation`, async () => {
    const view = await render(family, 'controlled-reject');
    view.root.click();
    await vi.waitFor(() =>
      expect(view.host.querySelector('#calls')!.textContent).toContain('true'),
    );
    expect(view.root.getAttribute('aria-checked')).toBe('false');
    expect(view.input.checked).toBe(false);
    expect(Array.from(new FormData(view.form).entries())).toEqual([['enabled', 'no']]);
  });
  it(`${family} actual React cancellation restores checked while native input/change still fire`, async () => {
    const view = await render(family, 'cancel');
    const events: string[] = [];
    view.form.addEventListener('input', () => events.push('input'));
    view.form.addEventListener('change', () => events.push('change'));
    view.root.click();
    await vi.waitFor(() =>
      expect(view.host.querySelector('#calls')!.textContent).toContain('true'),
    );
    expect(view.root.getAttribute('aria-checked')).toBe('false');
    expect(view.input.checked).toBe(false);
    expect(events).toEqual(['input', 'change']);
    await vi.waitFor(() => expect(view.host.querySelector('#input-events')!.textContent).toBe('1'));
  });
}
it('actual source CheckboxGroup reset leaves its owned logical child selection while native successful values reset', async () => {
  const view = await render('checkbox', 'group');
  const child = view.host.querySelector<HTMLElement>('[data-child="a"]')!;
  const values: string[] = [];
  view.host
    .querySelector('#group-form')!
    .addEventListener('input', (event) => values.push((event.target as HTMLInputElement).value));
  child.click();
  await vi.waitFor(() => expect(child.getAttribute('aria-checked')).toBe('true'));
  const form = view.host.querySelector<HTMLFormElement>('#group-form')!;
  const inputs = [...form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].slice(1);
  expect(inputs[0].checked).toBe(true);
  expect(inputs[0].defaultChecked).toBe(false);
  expect(values).toEqual(['']);
  form.reset();
  expect(inputs.map((input) => input.checked)).toEqual([false, false]);
  expect(child.getAttribute('aria-checked')).toBe('true');
  expect(Array.from(new FormData(form).entries())).toEqual([]);
});
