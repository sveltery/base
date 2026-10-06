// Native checkbox reset/rejected-owner characterization. Supplemental Svelte evidence.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import Fixture from './BooleanResetFixture.svelte';
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0)) await dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
function render(props: ComponentProps<typeof Fixture>) {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(Fixture, { target: host, props });
  cleanup.push(() => unmount(component));
  flushSync();
  const input = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  const form = host.querySelector('form')!;
  const root = host.querySelector<HTMLElement>('[role]');
  const click = async () => {
    (root ?? input).click();
    flushSync();
    await tick();
  };
  const reset = async () => {
    form.reset();
    flushSync();
    await tick();
  };
  const snapshot = () => ({
    aria: root?.getAttribute('aria-checked') ?? null,
    rootChecked: root?.hasAttribute('data-checked') ?? null,
    checked: input.checked,
    defaultChecked: input.defaultChecked,
    owner: host.querySelector('[data-owner]')!.textContent,
    filled: host.querySelector('[data-field]')!.hasAttribute('data-filled'),
    dirty: host.querySelector('[data-field]')!.hasAttribute('data-dirty'),
    entries: Array.from(new FormData(form).entries()),
    calls: JSON.parse(host.querySelector('[data-calls]')!.textContent!),
  });
  return { host, component, input, form, root, click, reset, snapshot };
}
it.each(['native-prop', 'native-bind'] as const)(
  'measures the plain Svelte %s reset and rejected-owner boundary',
  async (mode) => {
    const uncontrolled = render({ mode });
    await uncontrolled.click();
    await uncontrolled.reset();
    expect(uncontrolled.snapshot()).toMatchObject({
      checked: false,
      defaultChecked: false,
      entries: [],
      owner: mode === 'native-bind' ? 'false' : 'true',
    });
    const controlled = render({ mode, controlled: true });
    await controlled.click();
    expect(controlled.snapshot()).toMatchObject({
      checked: true,
      owner: 'false',
      entries: [['enabled', 'yes']],
    });
    await controlled.reset();
    expect(controlled.snapshot()).toMatchObject({
      checked: false,
      owner: 'false',
      entries: [],
    });
  },
);
for (const family of ['checkbox', 'switch'] as const) {
  it(`${family} native binding synchronizes uncontrolled reset, Field state and the first next click`, async () => {
    const view = render({ family });
    await view.click();
    expect(view.snapshot()).toMatchObject({
      aria: 'true',
      checked: true,
      filled: true,
      dirty: true,
    });
    await view.reset();
    expect(view.snapshot()).toMatchObject({
      aria: 'false',
      rootChecked: false,
      checked: false,
      defaultChecked: false,
      filled: false,
      dirty: false,
      entries: [],
      calls: [true],
    });
    await view.click();
    expect(view.snapshot()).toMatchObject({
      aria: 'true',
      checked: true,
      filled: true,
      dirty: true,
      entries: [['enabled', 'yes']],
      calls: [true, true],
    });
  });
  it(`${family} forwards native initial defaultChecked without rewriting it after each activation`, async () => {
    const view = render({ family, initial: true });
    expect(view.snapshot()).toMatchObject({
      aria: 'true',
      checked: true,
      defaultChecked: true,
      dirty: false,
    });
    await view.click();
    expect(view.snapshot()).toMatchObject({
      aria: 'false',
      checked: false,
      defaultChecked: true,
      dirty: true,
    });
    await view.reset();
    expect(view.snapshot()).toMatchObject({
      aria: 'true',
      checked: true,
      filled: true,
      dirty: false,
      entries: [['enabled', 'yes']],
      calls: [false],
    });
    await view.click();
    expect(view.snapshot()).toMatchObject({
      aria: 'false',
      checked: false,
      filled: false,
      dirty: true,
      calls: [false, false],
    });
  });
  it(`${family} honors cancellation of native form reset`, async () => {
    const view = render({ family });
    await view.click();
    view.form.addEventListener('reset', (event) => event.preventDefault(), {
      once: true,
    });
    await view.reset();
    expect(view.snapshot()).toMatchObject({
      aria: 'true',
      checked: true,
      filled: true,
      dirty: true,
      entries: [['enabled', 'yes']],
      calls: [true],
    });
  });
  it(`${family} preserves independent controlled and authored default values like a literal bound input`, async () => {
    for (const mode of ['native-bind', 'source'] as const) {
      const view = render({
        family,
        mode,
        initial: true,
        ownerInitial: false,
        controlled: true,
      });
      expect(view.snapshot()).toMatchObject({
        checked: false,
        defaultChecked: true,
        owner: 'false',
      });
      await view.reset();
      expect(view.snapshot()).toMatchObject({
        checked: true,
        defaultChecked: true,
        owner: 'false',
      });
      if (mode === 'source')
        expect(view.snapshot()).toMatchObject({
          aria: 'false',
          filled: false,
          dirty: false,
        });
    }
  });
  it(`${family} forwards authored default changes with native reset semantics`, async () => {
    const error = vi.spyOn(console, 'error');
    for (const mode of ['native-bind', 'source'] as const) {
      const view = render({ family, mode });
      view.component.authoredDefault(true);
      flushSync();
      await tick();
      expect(view.snapshot()).toMatchObject({ checked: false, defaultChecked: true });
      await view.reset();
      expect(view.snapshot()).toMatchObject({ checked: true, defaultChecked: true });
      if (mode === 'source')
        expect(view.snapshot()).toMatchObject({
          aria: 'true',
          filled: true,
          dirty: true,
        });
    }
    // Native Controlled omits React default diagnostics; all reset business above remains.
    expect(error).not.toHaveBeenCalled();
  });
  it(`${family} records the native controlled-owner rejection without a restoration kernel`, async () => {
    const view = render({ family, controlled: true });
    await view.click();
    expect(view.snapshot()).toMatchObject({
      aria: 'false',
      rootChecked: false,
      owner: 'false',
      checked: true,
      filled: false,
      dirty: false,
      entries: [['enabled', 'yes']],
      calls: [true],
    });
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
    flushSync();
    await tick();
    expect(JSON.parse(view.host.querySelector('[data-values]')!.textContent!)).toEqual({
      enabled: false,
    });
    await view.click();
    expect(view.snapshot()).toMatchObject({
      aria: 'false',
      checked: false,
      calls: [true, false],
    });
  });
  it(`${family} explicit callback cancellation keeps controlled UI, Field and native values aligned`, async () => {
    const view = render({ family, controlled: true, cancel: true });
    await view.click();
    expect(view.snapshot()).toMatchObject({
      aria: 'false',
      checked: false,
      filled: false,
      dirty: false,
      entries: [],
      calls: [true],
    });
  });
  it(`${family} controlled owner reset synchronizes visible and submitted state`, async () => {
    const view = render({ family, controlled: true });
    view.component.ownerSet(true);
    flushSync();
    await tick();
    await view.reset();
    // Native binding alone cannot change a controlled owner; match plain Svelte.
    expect(view.snapshot()).toMatchObject({
      aria: 'true',
      checked: false,
      owner: 'true',
      entries: [],
    });
    view.component.ownerSet(false);
    flushSync();
    await tick();
    expect(view.snapshot()).toMatchObject({
      aria: 'false',
      checked: false,
      owner: 'false',
      filled: false,
      dirty: false,
      entries: [],
    });
  });
}
