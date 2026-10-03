// Source contracts from Base UI 1.8.0 SwitchRoot/CheckboxRoot/CheckboxGroup.
// Supplemental native-Svelte probes, zero ordinary parity credit pending paired witnesses. MIT.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import { Switch } from '../../src/lib/switch/index.js';
import { Checkbox } from '../../src/lib/checkbox/index.js';
import Fixture from './BooleanFieldFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
function render(family: 'switch' | 'checkbox', props: Partial<ComponentProps<typeof Fixture>> = {}) {
  const host = document.createElement('div'); document.body.append(host);
  const component = mount(Fixture, { target: host, props: { family, ...props } });
  cleanups.push(() => unmount(component)); flushSync();
  return { host, component, root: () => host.querySelector<HTMLElement>(`[role="${family}"]`)!, input: () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!, form: () => host.querySelector('form')!, click() { host.querySelector<HTMLElement>(`[role="${family}"]`)!.click(); flushSync(); } };
}
for (const family of ['switch', 'checkbox'] as const) describe(family, () => {
  it('owns one root, hidden native checkbox, stateful part and Field registry', async () => {
    const submit = vi.fn(); const view = render(family, { submit });
    expect(view.host.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
    expect(view.root().getAttribute('aria-checked')).toBe('false');
    view.click(); await tick();
    expect(view.root().getAttribute('aria-checked')).toBe('true');
    expect(view.host.querySelector('[data-part]')!.hasAttribute('data-checked')).toBe(true);
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click(); flushSync(); await tick();
    expect(submit).toHaveBeenCalledTimes(1); expect(submit.mock.calls[0][0]).toEqual({ enabled: true });
    expect(new FormData(view.form()).get('enabled')).toBe('on');
  });
  it('uses source field label/description IDs and focuses visible control', () => {
    const view = render(family); const label = view.host.querySelector<HTMLLabelElement>('[data-label]')!;
    expect(label.htmlFor).toBe(view.input().id);
    expect(view.root().getAttribute('aria-labelledby')).toBe(label.id);
    expect(view.input().getAttribute('aria-describedby')).toBe(view.host.querySelector('[data-description]')!.id);
    view.input().focus(); expect(document.activeElement).toBe(view.root());
  });
  it('supports native wrapping labels using live aria fallback', async () => {
    const view = render(family, { scenario: 'label' }); await tick();
    const label = view.host.querySelector('label')!;
    expect(label.id).not.toBe(''); expect(view.root().getAttribute('aria-labelledby')).toBe(label.id);
    label.click(); flushSync(); expect(view.root().getAttribute('aria-checked')).toBe('true');
  });
  it('updates controlled owner state through checked callback', () => {
    const callback = vi.fn(); const view = render(family, { scenario: 'controlled', rootProps: { onCheckedChange: callback } });
    view.click(); expect(callback).toHaveBeenCalledTimes(1); expect(view.root().getAttribute('aria-checked')).toBe('true');
    view.component.setChecked(false); flushSync(); expect(view.root().getAttribute('aria-checked')).toBe('false'); expect(view.input().checked).toBe(false);
  });
  it.each(['field', 'controlled'])('native activation cancellation leaves DOM and source state unchanged (%s)', async scenario => {
    const callback = vi.fn((_value, details) => details.cancel()); const view = render(family, { scenario, rootProps: { onCheckedChange: callback } });
    const inputEvent = vi.fn(); view.form()?.addEventListener('input', inputEvent);
    view.click(); await tick();
    expect(callback).toHaveBeenCalledTimes(1); expect(callback.mock.calls[0][1].event.type).toBe('click');
    expect(view.root().getAttribute('aria-checked')).toBe('false'); expect(view.input().checked).toBe(false); expect(inputEvent).not.toHaveBeenCalled();
  });
  it('underlying canceled click is ignored and callback cancellation rolls back direct click', () => {
    const callback = vi.fn((_value, details) => details.cancel()); const view = render(family, { rootProps: { onCheckedChange: callback } });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true }); event.preventDefault();
    view.input().dispatchEvent(event); flushSync(); expect(callback).not.toHaveBeenCalled(); expect(view.input().checked).toBe(false);
    view.input().click(); flushSync(); expect(callback).toHaveBeenCalledTimes(1); expect(view.input().checked).toBe(false);
  });
  it.each(['disabled', 'readOnly'] as const)('blocks root and hidden input activation for %s', property => {
    const callback = vi.fn(); const view = render(family, { rootProps: { [property]: true, onCheckedChange: callback } });
    view.click(); view.input().click(); flushSync();
    expect(callback).not.toHaveBeenCalled(); expect(view.input().checked).toBe(false); expect(view.root().getAttribute('aria-checked')).toBe('false');
  });
  it('submits custom checked/unchecked values with source callback state', () => {
    const view = render(family, { rootProps: { value: 'yes', uncheckedValue: 'no' } });
    expect(new FormData(view.form()).getAll('enabled')).toEqual(['no']);
    view.click(); expect(new FormData(view.form()).getAll('enabled')).toEqual(['yes']);
    view.click(); expect(new FormData(view.form()).getAll('enabled')).toEqual(['no']);
  });
  it('preserves required native validation and source Field error/focus', async () => {
    const submit = vi.fn(); const view = render(family, { submit, rootProps: { required: true } });
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click(); flushSync(); await tick();
    expect(submit).not.toHaveBeenCalled(); expect(view.root().getAttribute('aria-invalid')).toBe('true'); expect(document.activeElement).toBe(view.root());
    view.click(); await tick();
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click(); flushSync(); await tick(); expect(submit).toHaveBeenCalledTimes(1);
  });
  it('passes boolean to custom Field validation and clears server errors on accepted change', async () => {
    const validation = vi.fn(value => value ? null : 'Must enable'); const submit = vi.fn(); const view = render(family, { validation, submit, errors: { enabled: 'Server error' } });
    expect(view.host.textContent).toContain('Server error');
    view.click(); await tick(); expect(view.host.textContent).not.toContain('Server error');
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click(); flushSync(); await tick();
    expect(validation).toHaveBeenCalledWith(true, expect.any(Object)); expect(submit).toHaveBeenCalledTimes(1);
  });
  it('cleans Field registration and hidden input when unmounted', async () => {
    const submit = vi.fn(); const view = render(family, { submit }); view.click();
    view.component.hide(); flushSync(); await tick(); expect(view.host.querySelector('input[type="checkbox"]')).toBeNull();
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click(); flushSync(); await tick();
    expect(submit.mock.calls[0][0]).toEqual({});
  });
  it('retains native reset behavior without a reset/checked restoration kernel', () => {
    const view = render(family, { rootProps: { defaultChecked: false } }); view.click();
    expect(view.input().checked).toBe(true); view.form().reset(); flushSync();
    // This is an observation of native Svelte checkbox defaults, not React parity.
    expect(view.input().checked).toBe(view.input().defaultChecked);
  });
  it('supports native button render replacement and attachment/ref forwarding', () => {
    const inputRef = { current: null as HTMLInputElement | null }; const view = render(family, { scenario: 'native', rootProps: { inputRef, id: 'visible-control' } });
    expect(view.root().tagName).toBe('BUTTON'); expect(view.root().id).toBe('visible-control'); expect(view.input().id).toBe(''); expect(inputRef.current).toBe(view.input());
    view.click(); expect(view.root().getAttribute('aria-checked')).toBe('true');
  });
});
describe('CheckboxGroup actual source composition', () => {
  it('registers one array Field and distinct native inputs/labels', async () => {
    const submit = vi.fn(); const view = render('checkbox', { scenario: 'group', submit });
    const roots = view.host.querySelectorAll<HTMLElement>('[role="checkbox"]');
    expect(roots).toHaveLength(3); expect(view.host.querySelector<HTMLLabelElement>('label')!.htmlFor).toBe('');
    roots[1].click(); flushSync(); await tick();
    expect(roots[0].getAttribute('aria-checked')).toBe('mixed'); expect(roots[0].getAttribute('aria-controls')).toBe(`${roots[1].id} ${roots[2].id}`);
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click(); flushSync(); await tick();
    expect(submit.mock.calls[0][0]).toEqual({ choices: ['a'] }); expect(new FormData(view.form()).getAll('choices')).toEqual(['a']);
  });
  it('parent toggles all, child mutation yields mixed state and group cancellation rolls back native activation', () => {
    const view = render('checkbox', { scenario: 'group' }); const roots = view.host.querySelectorAll<HTMLElement>('[role="checkbox"]');
    roots[0].click(); flushSync(); expect(roots[1].getAttribute('aria-checked')).toBe('true'); expect(roots[2].getAttribute('aria-checked')).toBe('true');
    roots[1].click(); flushSync(); expect(roots[0].getAttribute('aria-checked')).toBe('mixed');
    const canceled = render('checkbox', { scenario: 'group', canceled: true }); const canceledRoots = canceled.host.querySelectorAll<HTMLElement>('[role="checkbox"]');
    canceledRoots[1].click(); flushSync(); expect(canceledRoots[1].getAttribute('aria-checked')).toBe('false'); expect(canceled.host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1].checked).toBe(false);
  });
  it('parent respects disabled child successful controls', async () => {
    const submit = vi.fn(); const view = render('checkbox', { scenario: 'group', rootProps: { disabled: true }, submit });
    view.host.querySelector<HTMLElement>('[data-parent-control]')!.click(); flushSync(); await tick();
    view.host.querySelector<HTMLButtonElement>('[type="submit"]')!.click(); flushSync(); await tick();
    expect(submit.mock.calls[0][0]).toEqual({ choices: ['a'] }); expect(new FormData(view.form()).getAll('choices')).toEqual(['a']);
  });
});
it('parts fail clearly outside their actual source root', () => {
  const target = document.createElement('div');
  expect(() => mount(Switch.Thumb, { target })).toThrow('SwitchRootContext is missing');
  expect(() => mount(Checkbox.Indicator, { target })).toThrow('CheckboxRootContext is missing');
});
