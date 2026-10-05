// Source assertion adapters and separately named native supplements; MIT.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './RadioFixture.svelte';
import EdgesFixture from './RadioEdgesFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function setup(props: Record<string, unknown> = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(Fixture, { target: host, props });
  cleanups.push(() => unmount(component));
  flushSync();
  const radio = (value: string) =>
    host.querySelector<HTMLElement>(`[data-testid="radio-${value}"]`)!;
  const input = (value: string) =>
    host.querySelector<HTMLInputElement>(`#input-${value}`)!;
  const form = () => host.querySelector<HTMLFormElement>('#form')!;
  const click = (value: string) => {
    radio(value).click();
    flushSync();
  };
  const key = (value: string, key: string, options: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key,
      ...options,
    });
    radio(value).dispatchEvent(event);
    flushSync();
    return event;
  };
  return { host, component, radio, input, form, click, key };
}
it('RadioRoot:18 sets checked and unchecked data attributes', () => {
  const { radio } = setup();
  expect(radio('b').hasAttribute('data-checked')).toBe(true);
  expect(radio('b').hasAttribute('data-unchecked')).toBe(false);
  expect(radio('a').hasAttribute('data-unchecked')).toBe(true);
  expect(radio('a').hasAttribute('data-checked')).toBe(false);
});
it('RadioRoot:32 does not forward value prop to the visible root', () => {
  const { radio } = setup();
  expect(radio('a').hasAttribute('value')).toBe(false);
});
it('RadioGroup:38 calls onValueChange once when an item is clicked', () => {
  const changed = vi.fn();
  const { click, radio, input, host } = setup({ onChange: changed });
  click('a');
  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed.mock.lastCall?.[0]).toBe('a');
  expect(radio('a').getAttribute('aria-checked')).toBe('true');
  expect(input('a').checked).toBe(true);
  expect(host.querySelectorAll('input[type="radio"]')).toHaveLength(3);
});
it('supplement native radio repeats do not fire source value change', () => {
  const changed = vi.fn();
  const { click } = setup({ onChange: changed });
  click('a');
  click('a');
  expect(changed).toHaveBeenCalledTimes(1);
});
it('supplement native hidden click cancellation rolls back before input/change', () => {
  const changed = vi.fn();
  const { click, input, radio, form } = setup({
    cancel: true,
    onChange: changed,
  });
  const inputEvent = vi.fn();
  form().addEventListener('input', inputEvent);
  form().addEventListener('change', inputEvent);
  click('a');
  expect(changed).toHaveBeenCalledTimes(1);
  expect(input('a').checked).toBe(false);
  expect(input('b').checked).toBe(true);
  expect(radio('b').getAttribute('aria-checked')).toBe('true');
  expect(new FormData(form()).get('choice')).toBe('b');
  expect(inputEvent).not.toHaveBeenCalled();
});
it('supplement controlled owner updates flow through actual source group state', () => {
  const { component, click, radio, input } = setup({ controlled: true });
  click('a');
  expect(radio('a').getAttribute('aria-checked')).toBe('true');
  expect(input('a').checked).toBe(true);
  component.setValue('c');
  flushSync();
  expect(radio('c').getAttribute('aria-checked')).toBe('true');
  expect(input('c').checked).toBe(true);
});
for (const property of ['disabled', 'readOnly', 'fieldsetDisabled'])
  it(`supplement ${property} blocks checked state and value callback`, () => {
    const changed = vi.fn();
    const { click, input } = setup({ [property]: true, onChange: changed });
    click('a');
    expect(changed).not.toHaveBeenCalled();
    expect(input('b').checked).toBe(true);
  });
it('supplement Field name precedence, label registration and Form value projection', () => {
  const submit = vi.fn();
  const { host, click, form, radio, input } = setup({ onSubmit: submit });
  expect(input('a').name).toBe('choice');
  expect(host.querySelector<HTMLLabelElement>('#label-a')?.htmlFor).toBe(
    'input-a',
  );
  expect(radio('a').getAttribute('aria-labelledby')).toBe('label-a');
  expect(radio('a').getAttribute('aria-describedby')).toBe('description');
  click('c');
  form().dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  );
  flushSync();
  expect(submit).toHaveBeenLastCalledWith({ choice: 'c' });
});
it('supplement Composite establishes selected roving tab stop and selects with arrows', async () => {
  const { key, radio } = setup();
  expect(radio('b').tabIndex).toBe(0);
  expect(radio('a').tabIndex).toBe(-1);
  radio('b').focus();
  expect(key('b', 'ArrowRight').defaultPrevented).toBe(true);
  await tick();
  flushSync();
  expect(document.activeElement).toBe(radio('c'));
  expect(radio('c').getAttribute('aria-checked')).toBe('true');
  key('c', 'ArrowRight');
  await tick();
  flushSync();
  expect(document.activeElement).toBe(radio('a'));
  expect(radio('a').getAttribute('aria-checked')).toBe('true');
});
it('supplement Composite respects RTL and skips disabled items', async () => {
  const { key, radio } = setup({ rtl: true, disabledFirst: true });
  radio('b').focus();
  key('b', 'ArrowRight');
  await tick();
  flushSync();
  expect(document.activeElement).toBe(radio('c'));
});
it('supplement Composite preserves highlighted node after keyed DOM reorder and removal', async () => {
  const { component, key, radio } = setup();
  const selected = radio('b');
  component.update({ items: ['c', 'a', 'b'] });
  flushSync();
  await tick();
  flushSync();
  expect(selected.tabIndex).toBe(0);
  selected.focus();
  key('b', 'ArrowRight');
  await tick();
  flushSync();
  expect(document.activeElement).toBe(radio('c'));
  component.update({ items: ['a', 'b'] });
  flushSync();
  await tick();
  flushSync();
  expect(
    [...document.querySelectorAll<HTMLElement>('[role="radio"]')].filter(
      (node) => node.tabIndex === 0,
    ),
  ).toHaveLength(1);
});
it('supplement group registry drops removed radios and consumer representative refs', async () => {
  const ref = vi.fn();
  const submit = vi.fn();
  const { component, form, host } = setup({ onSubmit: submit, inputRef: ref });
  expect(ref.mock.lastCall?.[0]?.checked).toBe(true);
  component.update({ items: [] });
  flushSync();
  await tick();
  flushSync();
  expect(host.querySelector('input[type="radio"]')).toBe(null);
  expect(ref.mock.lastCall?.[0]).toBe(null);
  form().dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  );
  flushSync();
  expect(submit).toHaveBeenLastCalledWith({ choice: null });
});
it('supplement required empty group blocks submit through real Field validation', () => {
  const submit = vi.fn();
  const { form, click, input, host } = setup({
    initial: null,
    required: true,
    onSubmit: submit,
  });
  form().dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  );
  flushSync();
  expect(submit).not.toHaveBeenCalled();
  expect(host.querySelector('#field')?.hasAttribute('data-invalid')).toBe(true);
  click('a');
  form().dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  );
  flushSync();
  expect(input('a').checked).toBe(true);
  expect(submit).toHaveBeenLastCalledWith({ choice: 'a' });
});
it('supplement native button links id to visible button and removes hidden input id', () => {
  const { host, radio } = setup({ nativeButton: true });
  expect(radio('a').tagName).toBe('BUTTON');
  expect(radio('a').id).toBe('input-a');
  expect(radio('a').nextElementSibling?.hasAttribute('id')).toBe(false);
  host.querySelector<HTMLLabelElement>('#label-a')!.click();
  flushSync();
  expect(radio('a').getAttribute('aria-checked')).toBe('true');
});
it('supplement Radio Enter is canceled without activation and Space activates on keyup', () => {
  const changed = vi.fn();
  const { key, radio } = setup({ onChange: changed });
  expect(key('a', 'Enter').defaultPrevented).toBe(true);
  expect(changed).not.toHaveBeenCalled();
  key('a', ' ');
  expect(changed).not.toHaveBeenCalled();
  radio('a').dispatchEvent(
    new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }),
  );
  flushSync();
  expect(changed).toHaveBeenCalledTimes(1);
});
it('native characterization controlled rejection keeps source state and native activated input', () => {
  const { radio, input, click } = setup({
    controlled: true,
    ownerAccepts: false,
  });
  click('a');
  expect(radio('b').getAttribute('aria-checked')).toBe('true');
  expect(input('a').checked).toBe(true);
  expect(input('b').checked).toBe(false);
});

for (const controlled of [false, true])
  it(`native reset ${controlled ? 'controlled' : 'uncontrolled'} follows native checked defaults without changing source value`, () => {
    const changed = vi.fn();
    const { form, click, host, radio } = setup({
      controlled,
      onChange: changed,
    });
    const defaults = [
      ...host.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    ]
      .filter((input) => input.defaultChecked)
      .map((input) => input.value);
    click('a');
    form().reset();
    flushSync();
    expect(new FormData(form()).getAll('choice')).toEqual(defaults);
    expect(radio('a').getAttribute('aria-checked')).toBe('true');
    expect(changed).toHaveBeenCalledTimes(1);
  });

it('supplement source external form association is excluded from owner Form projection', () => {
  const submit = vi.fn();
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(EdgesFixture, {
    target: host,
    props: { onSubmit: submit },
  });
  cleanups.push(() => unmount(component));
  flushSync();
  const ownerForm = host.querySelector<HTMLFormElement>('#owner-form')!;
  const externalForm = host.querySelector<HTMLFormElement>('#external-form')!;
  expect(new FormData(externalForm).getAll('external')).toEqual(['a']);
  expect(new FormData(ownerForm).getAll('external')).toEqual([]);
  ownerForm.dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  );
  flushSync();
  expect(submit).toHaveBeenLastCalledWith({
    external: null,
    object: { storage: 'cloud', size: 42 },
    nullable: null,
  });
});
it('supplement source null/object serialization, context-free empty fallback and external labels', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(EdgesFixture, { target: host });
  cleanups.push(() => unmount(component));
  flushSync();
  const radio = (name: string) =>
    host.querySelector<HTMLElement>(`[data-testid="${name}-radio"]`)!;
  const input = (name: string) =>
    radio(name).nextElementSibling as HTMLInputElement;
  expect(input('object').value).toBe('{"storage":"cloud","size":42}');
  expect(input('null').value).toBe('');
  expect(radio('null').getAttribute('aria-checked')).toBe('true');
  radio('nonnull').click();
  flushSync();
  expect(radio('null').getAttribute('aria-checked')).toBe('false');
  expect(radio('nonnull').getAttribute('aria-checked')).toBe('true');
  expect(radio('standalone').getAttribute('aria-checked')).toBe('true');
  expect(radio('standalone').querySelector('[data-checked]')).not.toBe(null);
  await tick();
  flushSync();
  const external = radio('external');
  const labelledBy = external.getAttribute('aria-labelledby');
  expect(labelledBy).not.toBe(null);
  expect(host.querySelector(`#${labelledBy}`)?.textContent).toBe(
    'External option',
  );
});

it('supplement native hidden radio lengths preserve the source pixel geometry', () => {
  const { host } = setup();
  for (const input of host.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  )) {
    expect(input.style.width).toBe('1px');
    expect(input.style.height).toBe('1px');
    expect(input.style.margin).toBe('-1px');
  }
});
