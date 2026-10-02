// Native event boundary supplements; never credited as ordinary upstream assertions.
// Pinned Base Form propagation vs proposed Kit boundary: parity/field-form/enhancement-proposal.md.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './FieldFormFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
function setup(action = 'https://example.test/ordinary', method = 'post', asyncValidation = false) {
  const host = document.createElement('div'); document.body.append(host);
  const validate = vi.fn(() => asyncValidation ? new Promise<null>(() => {}) : null), onsubmit = vi.fn(), onFormSubmit = vi.fn();
  const component = mount(Fixture, { target: host, props: { validate, onsubmit, onFormSubmit } }); cleanups.push(() => unmount(component)); flushSync();
  const form = host.querySelector<HTMLFormElement>('#form')!; form.action = action; form.method = method;
  const later = vi.fn(), bubbling = vi.fn(); form.addEventListener('submit', later); host.addEventListener('submit', bubbling);
  return { component, form, validate, onsubmit, onFormSubmit, later, bubbling, input: host.querySelector<HTMLInputElement>('input')!,
    submit() { const event = new Event('submit', { cancelable: true, bubbles: true }); form.dispatchEvent(event); flushSync(); return event; } };
}
for (const [action, method] of [['https://example.test/ordinary', 'post'], ['https://example.test/?/remote=fixture', 'get']]) it(`ordinary invalid native Form keeps later listeners and bubbling for ${method} ${action}`, () => {
  const fixture = setup(action, method); fixture.component.update({ required: true }); flushSync();
  expect(fixture.submit().defaultPrevented).toBe(true); expect(fixture.later).toHaveBeenCalledOnce(); expect(fixture.bubbling).toHaveBeenCalledOnce();
  expect(fixture.onsubmit).not.toHaveBeenCalled(); expect(fixture.onFormSubmit).not.toHaveBeenCalled();
});
it('proposed invalid native remote action stops later listeners after the pinned synchronous validation boundary', () => {
  const fixture = setup('https://example.test/?/remote=fixture'); fixture.component.update({ required: true }); flushSync();
  expect(fixture.submit().defaultPrevented).toBe(true); expect(fixture.later).not.toHaveBeenCalled(); expect(fixture.bubbling).not.toHaveBeenCalled();
  expect(fixture.onsubmit).not.toHaveBeenCalled(); expect(fixture.onFormSubmit).not.toHaveBeenCalled(); expect(document.activeElement).toBe(fixture.input);
});
for (const asyncValidation of [false, true]) it(`valid native remote action preserves callbacks, consolidated prevention and later listeners with async=${asyncValidation}`, () => {
  const fixture = setup('https://example.test/?/remote=fixture', 'post', asyncValidation);
  expect(fixture.submit().defaultPrevented).toBe(true); expect(fixture.validate).toHaveBeenCalledOnce();
  expect(fixture.onsubmit).toHaveBeenCalledOnce(); expect(fixture.onFormSubmit).toHaveBeenCalledOnce(); expect(fixture.later).toHaveBeenCalledOnce(); expect(fixture.bubbling).toHaveBeenCalledOnce();
});
it('a native remote action targeting a new browsing context keeps source propagation', () => {
  const fixture = setup('https://example.test/?/remote=fixture'); fixture.form.target = '_blank'; fixture.component.update({ required: true }); flushSync();
  fixture.submit(); expect(fixture.later).toHaveBeenCalledOnce(); expect(fixture.bubbling).toHaveBeenCalledOnce();
});
it('native submitter overrides decide the actual action, method and target for the proposed boundary', () => {
  const fixture = setup('https://example.test/?/remote=fixture'); fixture.component.update({ required: true }); flushSync();
  const submitter = fixture.form.querySelector<HTMLButtonElement>('#submit')!; submitter.setAttribute('formaction', '/ordinary');
  fixture.form.dispatchEvent(new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true })); flushSync(); expect(fixture.later).toHaveBeenCalledOnce();
  submitter.removeAttribute('formaction'); submitter.setAttribute('formmethod', 'get'); fixture.form.dispatchEvent(new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true })); flushSync(); expect(fixture.later).toHaveBeenCalledTimes(2);
  submitter.removeAttribute('formmethod'); submitter.setAttribute('formtarget', '_blank'); fixture.form.dispatchEvent(new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true })); flushSync(); expect(fixture.later).toHaveBeenCalledTimes(3);
  submitter.removeAttribute('formtarget'); fixture.form.dispatchEvent(new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true })); flushSync(); expect(fixture.later).toHaveBeenCalledTimes(3);
});
