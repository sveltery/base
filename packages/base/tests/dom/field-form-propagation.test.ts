// Native event boundary supplements; never credited as ordinary upstream assertions.
// Pinned Base Form propagation vs proposed Kit boundary: parity/field-form/enhancement-proposal.md.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './FieldFormFixture.svelte';
import { isNativeKitRemoteSubmit } from '../../src/lib/form/remoteSubmit.js';
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
it('malformed ordinary and submitter action URLs preserve invalid-submit prevention and source propagation', () => {
  const fixture = setup('http://%'); fixture.component.update({ required: true }); flushSync();
  expect(fixture.submit().defaultPrevented).toBe(true); expect(fixture.later).toHaveBeenCalledOnce(); expect(fixture.bubbling).toHaveBeenCalledOnce();
  fixture.form.action = 'https://example.test/?/remote=fixture';
  const submitter = fixture.form.querySelector<HTMLButtonElement>('#submit')!; submitter.setAttribute('formaction', 'http://%');
  const event = new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true }); fixture.form.dispatchEvent(event); flushSync();
  expect(event.defaultPrevented).toBe(true); expect(fixture.later).toHaveBeenCalledTimes(2); expect(fixture.bubbling).toHaveBeenCalledTimes(2);
  expect(fixture.onsubmit).not.toHaveBeenCalled(); expect(fixture.onFormSubmit).not.toHaveBeenCalled();
});
for (const action of ['https://example.test/ordinary', 'https://example.test/?/remote=fixture']) it(`native form getters preserve the actual boundary despite instance property collisions for ${action}`, () => {
  const fixture = setup(action); fixture.component.update({ required: true }); flushSync();
  // JSDOM does not implement HTMLFormElement's named-property override semantics. Actual named
  // controls are measured separately in Chromium; these own properties exercise the same lookup hazard.
  Object.defineProperties(fixture.form, {
    action: { configurable: true, value: fixture.input }, method: { configurable: true, value: fixture.input }, target: { configurable: true, value: fixture.input },
    getAttribute: { configurable: true, value: fixture.input }, ownerDocument: { configurable: true, value: fixture.input }, baseURI: { configurable: true, value: fixture.input },
  });
  expect(fixture.submit().defaultPrevented).toBe(true);
  expect(fixture.later.mock.calls).toHaveLength(action.includes('/remote') ? 0 : 1); expect(fixture.bubbling.mock.calls).toHaveLength(action.includes('/remote') ? 0 : 1);
});
it('unavailable native submitter method getters fall through without attributing JSDOM browser semantics', () => {
  const fixture = setup('https://example.test/?/remote=fixture'); fixture.component.update({ required: true }); flushSync();
  const submitter = fixture.form.querySelector<HTMLButtonElement>('#submit')!;
  for (const method of ['', 'invalid', 'get', 'dialog']) {
    submitter.setAttribute('formmethod', method); fixture.form.dispatchEvent(new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true })); flushSync();
  }
  expect(Object.getOwnPropertyDescriptor(HTMLButtonElement.prototype, 'formMethod')?.get).toBeUndefined();
  expect(fixture.later).toHaveBeenCalledTimes(4);
  submitter.setAttribute('formmethod', 'POST'); fixture.form.dispatchEvent(new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true })); flushSync();
  expect(fixture.later).toHaveBeenCalledTimes(5);
});
it('a synthetic DIV submitter cannot qualify through remote-looking override attributes', () => {
  const fixture = setup('https://example.test/?/remote=fixture'); fixture.component.update({ required: true }); flushSync();
  const submitter = document.createElement('div');
  submitter.setAttribute('formmethod', 'post'); submitter.setAttribute('formaction', 'https://example.test/?/remote=fixture'); submitter.setAttribute('formtarget', '_self');
  const event = new SubmitEvent('submit', { submitter, cancelable: true, bubbles: true }); fixture.form.dispatchEvent(event); flushSync();
  expect(event.defaultPrevented).toBe(true); expect(fixture.later).toHaveBeenCalledOnce(); expect(fixture.bubbling).toHaveBeenCalledOnce();
  expect(fixture.onsubmit).not.toHaveBeenCalled(); expect(fixture.onFormSubmit).not.toHaveBeenCalled();
});
it('the proposed boundary brands the actual host even when every submitter override resembles a remote form', () => {
  const host = document.createElement('div'); const submitter = document.createElement('button');
  submitter.setAttribute('formmethod', 'post'); submitter.setAttribute('formaction', 'https://example.test/?/remote=fixture'); submitter.setAttribute('formtarget', '_self');
  let result: boolean | undefined; host.addEventListener('submit', event => { result = isNativeKitRemoteSubmit(event); });
  host.dispatchEvent(new SubmitEvent('submit', { submitter, bubbles: true })); expect(result).toBe(false);
});
it('native getter branding accepts an actual form owned by a different document', () => {
  const iframe = document.createElement('iframe'); document.body.append(iframe);
  const form = iframe.contentDocument!.createElement('form'); form.setAttribute('method', 'post'); form.setAttribute('action', 'https://example.test/?/remote=fixture'); iframe.contentDocument!.body.append(form);
  let result: boolean | undefined; form.addEventListener('submit', event => { result = isNativeKitRemoteSubmit(event); });
  form.dispatchEvent(new Event('submit', { bubbles: true })); expect(result).toBe(true);
});
