// Rendered source-family and separately named native supplements; zero ordinary credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NumberFieldFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.useRealTimers();
  document.body.replaceChildren();
});
function setup(props: Record<string, unknown> = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(Fixture, { target: host, props });
  cleanups.push(() => unmount(component));
  flushSync();
  const input = () => host.querySelector<HTMLInputElement>('[data-testid="visible"]')!;
  const hidden = () => host.querySelector<HTMLInputElement>('input[type="number"]')!;
  const field = () => host.querySelector<HTMLElement>('#number-field')!;
  const form = () => host.querySelector<HTMLFormElement>('#number-form')!;
  const traces = () => JSON.parse(host.querySelector('#number-traces')!.textContent!);
  const key = (key: string, options: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, ...options });
    input().dispatchEvent(event); flushSync(); return event;
  };
  const edit = (value: string) => { input().value = value; input().dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); flushSync(); };
  const blur = () => { input().dispatchEvent(new FocusEvent('blur')); flushSync(); };
  const click = (id = 'increase') => { host.querySelector<HTMLButtonElement>(`#${id}`)!.click(); flushSync(); };
  return { host, component, input, hidden, field, form, traces, key, edit, blur, click };
}
it('supplement visible and numeric inputs preserve source label, form value and initial Field state', () => {
  const { input, hidden, form, field } = setup();
  expect(input().type).toBe('text'); expect(input().value).toBe('2');
  expect(input().id).toBe('amount-input'); expect(input().getAttribute('aria-labelledby')).toBe('amount-label');
  expect(input().getAttribute('aria-describedby')).toContain('amount-description');
  expect(hidden().name).toBe('amount'); expect(input().name).toBe('');
  expect(new FormData(form()).getAll('amount')).toEqual(['2']);
  expect(field().hasAttribute('data-filled')).toBe(true); expect(field().hasAttribute('data-dirty')).toBe(false);
});
it('supplement typing retains text authority and blur commits the stored clamped numeric value', () => {
  const { edit, blur, input, hidden, traces, field } = setup({ options: { min: 0, max: 5 } });
  edit('12'); expect(input().value).toBe('12'); expect(hidden().value).toBe('5');
  expect(traces()).toEqual([{ kind: 'change', value: 5, reason: 'input-change', type: 'input' }]);
  expect(field().hasAttribute('data-dirty')).toBe(true);
  blur(); expect(input().value).toBe('5'); expect(traces().at(-1)).toMatchObject({ kind: 'commit', value: 5, reason: 'input-blur' });
  expect(field().hasAttribute('data-touched')).toBe(true);
});
it('supplement allowOutOfRange applies only to text and actual native hidden constraints', async () => {
  const { edit, hidden, key, input } = setup({ options: { min: 0, max: 5, allowOutOfRange: true }, validationMode: 'onChange' });
  edit('12'); expect(hidden().value).toBe('12'); expect(hidden().validity.rangeOverflow).toBe(true);
  await tick(); key('ArrowDown'); expect(hidden().value).toBe('5'); expect(input().value).toBe('5');
});
it('supplement keyboard modifier precedence, Home/End and boundary no-op commits', () => {
  const { key, hidden, traces } = setup({ options: { min: 0, max: 20, smallStep: 0.25, largeStep: 4 } });
  key('ArrowUp', { altKey: true, shiftKey: true }); expect(hidden().value).toBe('2.25');
  key('ArrowUp', { shiftKey: true }); expect(hidden().value).toBe('6.25');
  key('Home'); expect(hidden().value).toBe('0'); key('End'); expect(hidden().value).toBe('20');
  const count = traces().length; key('ArrowUp'); expect(traces()).toHaveLength(count);
});
it('supplement a canceled keyboard change applies no numeric change and no commit', () => {
  const { key, hidden, input, traces } = setup({ cancel: true });
  key('ArrowUp'); expect(hidden().value).toBe('2'); expect(input().value).toBe('2');
  expect(traces()).toHaveLength(1); expect(traces()[0]).toMatchObject({ kind: 'change', value: 3, reason: 'keyboard' });
});
it('supplement controlled callbacks and external owners retain actual numeric authority', () => {
  const { key, hidden, component, input } = setup({ controlled: true });
  key('ArrowUp'); expect(hidden().value).toBe('3');
  component.setOwner(1234.56789); flushSync(); expect(hidden().value).toBe('1234.56789'); expect(input().value).toBe('1,234.568');
});
it('supplement rejected controlled keyboard owner restores source formatting', () => {
  const { key, hidden, input } = setup({ controlled: true, reject: true });
  key('ArrowUp'); expect(hidden().value).toBe('2'); expect(input().value).toBe('2');
});
it('supplement consecutive native keyboard handlers use the current numeric value before DOM synchronization', () => {
  const { input, hidden, traces } = setup();
  for (let index = 0; index < 3; index++) input().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowUp' }));
  flushSync(); expect(hidden().value).toBe('5');
  expect(traces().filter((trace: { kind: string }) => trace.kind === 'commit').map((trace: { value: number }) => trace.value)).toEqual([3, 4, 5]);
});
it('supplement stepping uses authoritative precision instead of rounded display', () => {
  const { hidden, key, blur, click } = setup({ initial: 1.23456789, options: { step: 0.1 } });
  blur(); expect(hidden().value).toBe('1.23456789');
  key('ArrowUp'); expect(hidden().value).toBe('1.33456789');
  click(); expect(hidden().value).toBe('1.43456789');
});
it('supplement clear commits only after a manual edit and never when an untouched empty field blurs', () => {
  const { edit, blur, hidden, traces } = setup();
  edit(''); expect(hidden().value).toBe(''); blur(); expect(traces().at(-1)).toMatchObject({ kind: 'commit', value: null, reason: 'input-clear' });
  const count = traces().length; blur(); expect(traces()).toHaveLength(count);
});
it('supplement preventBaseUIHandler suppresses native internal edit and keyboard channels', () => {
  const { edit, key, hidden, traces } = setup({ preventInput: true, preventKey: true });
  edit('8'); key('ArrowUp'); expect(hidden().value).toBe('2'); expect(traces()).toEqual([]);
});
for (const property of ['disabled', 'readOnly']) it(`supplement ${property} gates keyboard, button and wheel value changes`, () => {
  const { key, click, input, hidden, traces } = setup({ options: { [property]: true, allowWheelScrub: true } });
  key('ArrowUp'); click(); input().focus(); input().dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -1 }));
  flushSync(); expect(hidden().value).toBe('2'); expect(traces()).toEqual([]);
});
it('supplement wheel ignores pinch/horizontal gestures and commits each actual discrete change', () => {
  const { input, hidden, traces } = setup({ options: { allowWheelScrub: true, max: 3 } });
  input().focus(); flushSync();
  const wheel = (options: WheelEventInit) => { const event = new WheelEvent('wheel', { cancelable: true, ...options }); input().dispatchEvent(event); flushSync(); return event; };
  expect(wheel({ deltaY: -10, ctrlKey: true }).defaultPrevented).toBe(false);
  expect(wheel({ deltaY: 1, deltaX: -10 }).defaultPrevented).toBe(false);
  expect(wheel({ deltaY: -1 }).defaultPrevented).toBe(true); expect(hidden().value).toBe('3');
  expect(traces().at(-1)).toMatchObject({ kind: 'commit', value: 3, reason: 'wheel' });
  const count = traces().length; wheel({ deltaY: -1 }); expect(traces()).toHaveLength(count);
});
it('supplement shared native renderer refs detach old hosts and register replacement inputs', () => {
  const inputRef = vi.fn();
  const { component, input, hidden } = setup({ inputRef });
  expect(inputRef).toHaveBeenCalledWith(hidden());
  const first = input(); expect(component.refs().input).toBe(first);
  component.replaceInput(); flushSync(); expect(input()).not.toBe(first); expect(first.isConnected).toBe(false);
  expect(component.refs().input).toBe(input());
  component.toggleInput(); flushSync(); expect(component.refs().input).toBeNull();
  component.toggleInput(); flushSync(); expect(component.refs().input).toBe(input());
  component.toggleRoot(); flushSync(); expect(inputRef).toHaveBeenLastCalledWith(null);
});
it('supplement actual Field custom validation receives numeric value and entire Form registry', async () => {
  const validate = vi.fn((value: unknown, values: Record<string, unknown>) => value === 7 && values.amount === 7 ? 'Seven unavailable' : null);
  const { edit, blur, host } = setup({ validationMode: 'onBlur', validate });
  edit('7'); blur(); await tick(); flushSync();
  expect(validate).toHaveBeenCalledWith(7, { amount: 7 }); expect(host.querySelector('#number-error')!.textContent).toBe('Seven unavailable');
});
for (const asyncValidation of [false, true]) for (const controlled of [false, true]) it(`source rounding-on-blur retains complete ${asyncValidation ? 'async' : 'sync'} custom validity after synchronization (${controlled ? 'controlled' : 'uncontrolled'})`, async () => {
  const validate = vi.fn(() => asyncValidation ? Promise.resolve('Rounded amount rejected') : 'Rounded amount rejected');
  const { input, hidden, blur, host, component, traces } = setup({ initial: 1.234, controlled, validationMode: 'onBlur', options: { step: 'any', locale: 'en-US', format: { maximumFractionDigits: 2 } }, validate });
  expect(input().value).toBe('1.23'); expect(hidden().value).toBe('1.234');
  blur(); await tick(); await Promise.resolve(); flushSync();
  const validity = () => JSON.parse(host.querySelector('#validity')!.textContent!);
  expect(validate).toHaveBeenCalledTimes(1); expect(validate).toHaveBeenCalledWith(1.23, { amount: 1.234 });
  expect(hidden().value).toBe('1.23'); expect(input().value).toBe('1.23');
  expect(validity()).toMatchObject({ value: 1.23, initialValue: 1.234, state: { valid: false, customError: true }, error: 'Rounded amount rejected', errors: ['Rounded amount rejected'] });
  expect(traces()).toEqual([{ kind: 'change', value: 1.23, reason: 'input-blur', type: 'blur' }, { kind: 'commit', value: 1.23, reason: 'input-blur', type: 'blur' }]);
  if (controlled) {
    component.setOwner(4); flushSync(); await tick(); flushSync();
    expect(hidden().value).toBe('4'); expect(input().value).toBe('4');
    expect(validity()).toMatchObject({ value: 4, initialValue: 1.234, state: { valid: true, customError: false }, error: '', errors: [] });
    expect(validate).toHaveBeenCalledTimes(1);
  }
});
function pointer(target: EventTarget, type: string, options: Partial<PointerEvent> = {}) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries({ pointerType: 'mouse', movementX: 0, movementY: 0, ...options })) Object.defineProperty(event, key, { value });
  target.dispatchEvent(event); flushSync(); return event;
}
it('supplement press-and-hold preserves immediate, 400ms delay, 60ms repeat and one release commit', () => {
  vi.useFakeTimers();
  const { host, hidden, traces } = setup();
  pointer(host.querySelector('#increase')!, 'pointerdown'); expect(hidden().value).toBe('3');
  vi.advanceTimersByTime(399); flushSync(); expect(hidden().value).toBe('3');
  vi.advanceTimersByTime(60); flushSync(); expect(hidden().value).toBe('3');
  vi.advanceTimersByTime(1); flushSync(); expect(hidden().value).toBe('4');
  vi.advanceTimersByTime(60); flushSync(); expect(hidden().value).toBe('5');
  pointer(window, 'pointerup'); expect(traces().filter((trace: { kind: string }) => trace.kind === 'commit')).toEqual([{ kind: 'commit', value: 5, reason: 'increment-press', type: 'pointerup' }]);
  vi.advanceTimersByTime(500); flushSync(); expect(hidden().value).toBe('5');
});
it('supplement touch quick tap never starts the delayed hold and its synthesized click applies one step', () => {
  vi.useFakeTimers();
  const { host, hidden, traces } = setup();
  const button = host.querySelector('#increase')!;
  pointer(button, 'pointerdown', { pointerType: 'touch' });
  pointer(button, 'pointerup', { pointerType: 'touch' });
  vi.advanceTimersByTime(60); flushSync(); expect(hidden().value).toBe('2');
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })); flushSync();
  expect(hidden().value).toBe('3'); expect(traces()).toHaveLength(2);
});
it('supplement source hold cancellation stops ticks but retains its release commit of the current value', () => {
  vi.useFakeTimers();
  const { host, hidden, traces } = setup({ cancel: true });
  pointer(host.querySelector('#increase')!, 'pointerdown');
  vi.advanceTimersByTime(1000); flushSync(); expect(hidden().value).toBe('2'); expect(traces()).toHaveLength(1);
  pointer(window, 'pointerup'); expect(traces().at(-1)).toMatchObject({ kind: 'commit', value: 2, reason: 'increment-press' });
});
it('supplement source mouseleave/reenter replaces release listeners and unmount cancels owned work', () => {
  vi.useFakeTimers();
  const onCommit = vi.fn(), onChange = vi.fn();
  const { host, hidden, component } = setup({ onCommit, onChange });
  const button = host.querySelector('#increase')!;
  pointer(button, 'pointerdown');
  button.dispatchEvent(new MouseEvent('mouseleave')); flushSync();
  vi.advanceTimersByTime(1000); flushSync(); expect(hidden().value).toBe('3');
  button.dispatchEvent(new MouseEvent('mouseenter')); flushSync(); expect(hidden().value).toBe('4');
  pointer(window, 'pointerup'); expect(onCommit).toHaveBeenCalledTimes(1);
  pointer(button, 'pointerdown');
  component.toggleRoot(); flushSync(); const count = onChange.mock.calls.length;
  vi.advanceTimersByTime(1000); pointer(window, 'pointerup');
  expect(onChange).toHaveBeenCalledTimes(count); expect(onCommit).toHaveBeenCalledTimes(1);
});
it('supplement source scrub uses raw movement after sensitivity threshold and releases its cursor portal', async () => {
  const lock = vi.fn().mockResolvedValue(undefined), exit = vi.fn();
  const lockDescriptor = Object.getOwnPropertyDescriptor(document.body, 'requestPointerLock');
  const exitDescriptor = Object.getOwnPropertyDescriptor(document, 'exitPointerLock');
  Object.defineProperty(document.body, 'requestPointerLock', { configurable: true, value: lock });
  Object.defineProperty(document, 'exitPointerLock', { configurable: true, value: exit });
  try {
    const { host, hidden, traces } = setup({ withScrub: true });
    pointer(host.querySelector('[data-testid="scrub"]')!, 'pointerdown', { clientX: 25, clientY: 30 });
    await tick(); flushSync();
    const cursor = document.querySelector('[data-testid="cursor"]')!;
    expect(cursor.parentElement).toBe(document.body); expect(lock).toHaveBeenCalledTimes(1);
    pointer(window, 'pointermove', { movementX: 1 }); expect(hidden().value).toBe('2');
    pointer(window, 'pointermove', { movementX: 3 }); expect(hidden().value).toBe('5');
    pointer(window, 'pointerup'); expect(exit).toHaveBeenCalledTimes(1); expect(cursor.isConnected).toBe(false);
    expect(traces().at(-1)).toMatchObject({ kind: 'commit', value: 5, reason: 'scrub' });
    const count = traces().length; pointer(window, 'pointermove', { movementX: 10 }); pointer(window, 'pointerup'); expect(traces()).toHaveLength(count);
  } finally {
    if (lockDescriptor) Object.defineProperty(document.body, 'requestPointerLock', lockDescriptor); else Reflect.deleteProperty(document.body, 'requestPointerLock');
    if (exitDescriptor) Object.defineProperty(document, 'exitPointerLock', exitDescriptor); else Reflect.deleteProperty(document, 'exitPointerLock');
  }
});
