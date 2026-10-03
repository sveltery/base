// Native event supplements, zero ordinary assertion credit.
// Source: Base UI v1.8.0 Form.tsx validation → focus → preventDefault → return.
// Kit cancellation integration remains unresolved; no action-URL or listener guard belongs here.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './FieldFormFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
function setup(action: string, method = 'post') {
  const host = document.createElement('div'); document.body.append(host);
  const onsubmit = vi.fn(), onFormSubmit = vi.fn();
  const component = mount(Fixture, { target: host, props: { onsubmit, onFormSubmit } });
  cleanups.push(() => unmount(component)); flushSync();
  const form = host.querySelector<HTMLFormElement>('#form')!; form.action = action; form.method = method;
  const later = vi.fn(), bubbling = vi.fn(); form.addEventListener('submit', later); host.addEventListener('submit', bubbling);
  return { component, form, onsubmit, onFormSubmit, later, bubbling, input: host.querySelector<HTMLInputElement>('input')!,
    submit() { const event = new Event('submit', { cancelable: true, bubbles: true }); form.dispatchEvent(event); flushSync(); return event; } };
}
for (const action of ['https://example.test/ordinary', 'https://example.test/?/remote=fixture']) {
  it(`invalid Form prevents native submission and preserves listener propagation for ${action}`, () => {
    const fixture = setup(action); fixture.component.update({ required: true }); flushSync();
    expect(fixture.submit().defaultPrevented).toBe(true);
    expect(fixture.later).toHaveBeenCalledOnce(); expect(fixture.bubbling).toHaveBeenCalledOnce();
    expect(fixture.onsubmit).not.toHaveBeenCalled(); expect(fixture.onFormSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(fixture.input);
  });
  it(`valid Form retains native listener propagation and consolidated callback for ${action}`, () => {
    const fixture = setup(action);
    expect(fixture.submit().defaultPrevented).toBe(true);
    expect(fixture.onsubmit).toHaveBeenCalledOnce(); expect(fixture.onFormSubmit).toHaveBeenCalledOnce();
    expect(fixture.later).toHaveBeenCalledOnce(); expect(fixture.bubbling).toHaveBeenCalledOnce();
  });
}
