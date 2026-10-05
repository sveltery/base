// Real public native-snippet acceptance; supplemental, zero unchanged React renderer credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/NativeSnippetFixture.svelte';
import FieldFixture from './NativeSnippetFieldFixture.svelte';
import NestedFixture from './NativeNestedButtonFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  for (const app of mounted.splice(0)) await unmount(app);
  document.body.replaceChildren();
});
function setup(props: ComponentProps<typeof Fixture> = {}) {
  const target = document.createElement('div');
  document.body.append(target);
  const app = mount(Fixture, { target, props });
  mounted.push(app);
  flushSync();
  return {
    target,
    app,
    host: () => target.querySelector<HTMLElement>('#native-toggle')!,
  };
}
it('uses the real default button, state, children and host binding', () => {
  const { app, host } = setup();
  expect(host().tagName).toBe('BUTTON');
  expect(host().getAttribute('type')).toBe('button');
  expect(host().getAttribute('aria-pressed')).toBe('false');
  expect(host().hasAttribute('data-pressed')).toBe(false);
  expect(host().textContent).toContain('Native children idle');
  expect(app.snapshot().ref).toBe(host());
  host().click();
  flushSync();
  expect(
    app.snapshot().calls.filter((call) => !call.startsWith('attach')),
  ).toEqual(['consumer:false', 'change:true:false:click']);
  expect(host().getAttribute('aria-pressed')).toBe('true');
  expect(host().getAttribute('data-pressed')).toBe('');
  expect(host().textContent).toContain('Native children pressed');
});
it('passes complete merged props, the real typed state and children to the native snippet', () => {
  const { app, host } = setup({ mode: 'span' });
  const received = app.snapshot().received[0]!;
  expect(received.props).toMatchObject({
    id: 'native-toggle',
    class: 'before',
    style: 'color:red;padding:10px',
    'aria-pressed': false,
  });
  expect(received.state).toEqual({ disabled: false, pressed: false });
  expect(typeof received.children).toBe('function');
  expect(Object.getOwnPropertySymbols(received.props).length).toBeGreaterThan(
    0,
  );
  expect(host().tagName).toBe('SPAN');
  expect(app.snapshot().ref).toBe(host());
  expect(host().className).toBe('owned before');
  expect(host().style.padding).toBe('10px');
  expect(host().style.color).toBe('blue');
  expect(host().style.fontSize).toBe('16px');
  expect(host().textContent).toContain('Native children idle');
});
it('retains a stable snippet host while state, class, style and children update', () => {
  const { app, host } = setup({ mode: 'span' });
  const initial = host();
  app.setClass(['updated', { active: true }]);
  app.setStyle('color:green;padding:20px');
  app.setPressed(true);
  flushSync();
  expect(host()).toBe(initial);
  expect(app.snapshot().ref).toBe(initial);
  expect(host().className).toBe('owned updated active');
  expect(host().style.color).toBe('blue');
  expect(host().style.padding).toBe('20px');
  expect(host().getAttribute('data-snippet-pressed')).toBe('true');
  expect(host().textContent).toContain('Native children pressed');
  expect(
    app.snapshot().calls.filter((call) => call.startsWith('attach')),
  ).toHaveLength(1);
});
for (const [before, after, beforeTag, afterTag] of [
  ['default', 'span', 'BUTTON', 'SPAN'],
  ['span', 'default', 'SPAN', 'BUTTON'],
  ['span', 'section', 'SPAN', 'SECTION'],
  ['span', 'same-span', 'SPAN', 'SPAN'],
] as const)
  it(`uses native branch/identity replacement from ${before} to ${after}`, () => {
    const { app, host } = setup({ mode: before });
    const initial = host();
    app.setMode(after);
    flushSync();
    expect(host()).not.toBe(initial);
    expect(initial.isConnected).toBe(false);
    expect(host().tagName).toBe(afterTag);
    expect(app.snapshot().ref).toBe(host());
    expect(
      app
        .snapshot()
        .calls.some((call) => call.startsWith(`cleanup:0:${beforeTag}:false:`)),
    ).toBe(true);
  });
it('lets authored attachments update independently while the component binding retains its host', () => {
  const { app, host } = setup({ mode: 'span' });
  const initial = host();
  app.updateAttachment();
  flushSync();
  expect(host()).toBe(initial);
  expect(app.snapshot().ref).toBe(initial);
  expect(app.snapshot().calls).toEqual([
    'attach:0:SPAN:true:owned before',
    'cleanup:0:SPAN:true:owned before',
    'attach:1:SPAN:true:owned before',
  ]);
  app.hide();
  flushSync();
  expect(initial.isConnected).toBe(false);
  expect(app.snapshot().ref).toBeNull();
  expect(app.snapshot().calls.at(-1)).toBe('cleanup:1:SPAN:false:owned before');
});
for (const mode of ['default', 'span'] as const)
  it(`preserves event-detail cancellation on ${mode}`, () => {
    const { app, host } = setup({ mode, cancel: true });
    host().click();
    flushSync();
    expect(app.snapshot().pressed).toBe(false);
    expect(host().getAttribute('aria-pressed')).toBe('false');
    expect(
      app
        .snapshot()
        .calls.filter(
          (call) => call.startsWith('consumer') || call.startsWith('change'),
        ),
    ).toEqual(['consumer:false', 'change:true:false:click']);
  });
for (const prevention of ['none', 'default', 'base'] as const)
  it(`preserves independent native and Base handler prevention (${prevention})`, () => {
    const { app, host } = setup({ mode: 'span', prevention });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    host().dispatchEvent(event);
    flushSync();
    expect(event.defaultPrevented).toBe(prevention === 'default');
    expect(app.snapshot().pressed).toBe(prevention !== 'base');
    expect(
      app.snapshot().calls.filter((call) => call.startsWith('change')),
    ).toHaveLength(prevention === 'base' ? 0 : 1);
  });
for (const mode of ['default', 'span'] as const)
  it(`preserves disabled business props and suppresses activation on ${mode}`, () => {
    const { app, host } = setup({ mode, disabled: true });
    host().click();
    flushSync();
    expect(host().hasAttribute('data-disabled')).toBe(true);
    expect(app.snapshot().pressed).toBe(false);
    expect(
      app.snapshot().calls.filter((call) => call.startsWith('change')),
    ).toEqual([]);
  });
it('forwards nested real Button attachments independently and clears both native bindings', () => {
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(NestedFixture, { target });
  mounted.push(app);
  flushSync();
  const button = target.querySelector('button')!;
  expect(app.snapshot()).toMatchObject({ outer: button, inner: button });
  expect(button.textContent).toBe('Nested children');
  expect(
    app.snapshot().calls.filter((call) => call.startsWith('outer:')),
  ).toHaveLength(1);
  app.updateInner();
  flushSync();
  expect(target.querySelector('button')).toBe(button);
  expect(app.snapshot()).toMatchObject({ outer: button, inner: button });
  expect(
    app.snapshot().calls.filter((call) => call.startsWith('outer:')),
  ).toHaveLength(1);
  expect(app.snapshot().calls).toContain('inner-cleanup:0:true');
  expect(app.snapshot().calls).toContain('inner:1:BUTTON');
  app.hide();
  flushSync();
  expect(app.snapshot()).toMatchObject({ outer: null, inner: null });
  expect(app.snapshot().calls).toContain('outer-cleanup:false');
  expect(app.snapshot().calls).toContain('inner-cleanup:1:false');
});
it('keeps Input delegated to Field.Control through native snippets, IDs, ARIA and Form registration', async () => {
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(FieldFixture, { target });
  mounted.push(app);
  flushSync();
  const input = target.querySelector<HTMLInputElement>('#native-input')!;
  expect(app.snapshot()).toMatchObject({
    field: target.querySelector('section'),
    control: input,
    label: target.querySelector('label'),
    description: target.querySelector('#native-description'),
  });
  expect(input.value).toBe('seed');
  expect(input.id).toBe('native-input');
  expect(input.name).toBe('email');
  expect(target.querySelector('label')?.htmlFor).toBe(input.id);
  expect(input.getAttribute('aria-describedby')).toBe('native-description');
  expect(input.className).toBe('owned-input filled-input');
  expect(input.style.color).toBe('blue');
  expect(input.style.padding).toBe('10px');
  input.value = 'edited';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  flushSync();
  await tick();
  expect(app.snapshot().calls).toEqual(['consumer', 'value']);
  expect(app.snapshot().value).toBe('edited');
  target.querySelector<HTMLButtonElement>('button')!.click();
  flushSync();
  await tick();
  expect(app.snapshot().submitted).toEqual([{ email: 'edited' }]);
  app.hide();
  flushSync();
  await tick();
  expect(app.snapshot()).toMatchObject({
    field: null,
    control: null,
    label: null,
    description: null,
  });
  target.querySelector<HTMLButtonElement>('button')!.click();
  flushSync();
  await tick();
  expect(app.snapshot().submitted.at(-1)).toEqual({});
});
