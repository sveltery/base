// Current native source-bug supplements against real Field/Form providers; zero upstream credit.
// DOM-model focus/events do not certify trusted browser focus, pointer lock, or native validity.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NumberFieldFixture.svelte';
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
  const input = host.querySelector<HTMLInputElement>('[data-testid="visible"]')!;
  const hidden = host.querySelector<HTMLInputElement>('input[type="number"]')!;
  const traces = () => JSON.parse(host.querySelector('#number-traces')!.textContent!);
  const edit = (value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    flushSync();
  };
  const key = () => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowUp' }),
    );
    flushSync();
  };
  return { host, component, input, hidden, traces, edit, key };
}
function pointer(target: EventTarget, type: string) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries({
    pointerType: 'mouse',
    movementX: 0,
    movementY: 0,
    clientX: 25,
    clientY: 30,
  }))
    Object.defineProperty(event, key, { value });
  target.dispatchEvent(event);
  flushSync();
}
it('current canceled dirty-sync reproduces pin Increment L703 proposals [100,100,1], retained100 and no commit', () => {
  const { host, input, hidden, edit, traces } = setup({ initial: 0, cancel: true });
  input.focus();
  edit('100');
  host.querySelector<HTMLButtonElement>('#increase')!.click();
  flushSync();
  expect(
    traces()
      .filter((entry: { kind: string }) => entry.kind === 'change')
      .map((entry: { value: number }) => entry.value),
  ).toEqual([100, 100, 1]);
  expect(traces().filter((entry: { kind: string }) => entry.kind === 'commit')).toEqual([]);
  expect(input.value).toBe('100');
  expect(hidden.value).toBe('0');
});
for (const method of ['keyboard', 'wheel', 'button'] as const) {
  it(`current issue83 ${method} accepted3 then owner42 no-movement scrub commits stale3`, async () => {
    const { host, component, input, hidden, key, traces } = setup({
      controlled: true,
      withScrub: true,
      options: { allowWheelScrub: true },
    });
    input.focus();
    flushSync();
    if (method === 'keyboard') key();
    else if (method === 'wheel') {
      input.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -1 }));
      flushSync();
    } else {
      host.querySelector<HTMLButtonElement>('#increase')!.click();
      flushSync();
    }
    expect(hidden.value).toBe('3');
    component.setOwner(42);
    flushSync();
    expect(input.value).toBe('42');
    expect(hidden.value).toBe('42');
    const before = traces();
    pointer(host.querySelector('[data-testid="scrub"]')!, 'pointerdown');
    await tick();
    flushSync();
    pointer(window, 'pointerup');
    expect(traces().slice(before.length)).toEqual([
      { kind: 'commit', value: 3, reason: 'scrub', type: 'pointerup' },
    ]);
    expect(input.value).toBe('42');
    expect(hidden.value).toBe('42');
  });
}
for (const reject of [false, true]) {
  it(`current issue84 focused dirty2.70 owner42 blur proposes/commits2.7 (${reject ? 'declining' : 'accepting'})`, () => {
    const { component, input, hidden, edit, traces } = setup({
      controlled: true,
      reject,
      options: { step: 'any' },
    });
    input.focus();
    edit('2.70');
    component.setOwner(42);
    flushSync();
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('2.70');
    expect(hidden.value).toBe('42');
    const before = traces().length;
    input.blur();
    flushSync();
    expect(
      traces()
        .slice(before)
        .map(({ kind, value, reason }: { kind: string; value: number; reason: string }) => ({
          kind,
          value,
          reason,
        })),
    ).toEqual([
      { kind: 'change', value: 2.7, reason: 'input-blur' },
      { kind: 'commit', value: 2.7, reason: 'input-blur' },
    ]);
    expect(input.value).toBe(reject ? '42' : '2.7');
    expect(hidden.value).toBe(reject ? '42' : '2.7');
  });
}
for (const primed of [false, true]) {
  it(`current issue85 canceled hidden8 validates ${primed ? 'primed lastChanged3' : 'fresh parsed8'}`, async () => {
    const validation: unknown[] = [];
    const { input, hidden, key, traces } = setup({
      controlled: true,
      validationMode: 'onChange',
      onChange: (_value: unknown, details: { reason: string; cancel: () => void }) => {
        if (details.reason === 'none') details.cancel();
      },
      validate: (value: unknown) => {
        validation.push(value);
        return null;
      },
    });
    if (primed) {
      key();
      await tick();
      flushSync();
      expect(hidden.value).toBe('3');
    }
    validation.length = 0;
    hidden.value = '8';
    hidden.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    await tick();
    flushSync();
    expect(traces().at(-1)).toMatchObject({ kind: 'change', value: 8, reason: 'none' });
    expect(validation).toEqual([primed ? 3 : 8]);
    expect(input.value).toBe(primed ? '3' : '2');
  });
}
