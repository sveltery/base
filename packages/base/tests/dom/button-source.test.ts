// Actual public Button composition over source helpers; supplementary predicates earn no ordinary credit. MIT.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/ButtonSourceFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
async function setup(scenario: string) {
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario } }); mounted.push(component); await tick();
  return { component, button: document.getElementById('source-button')! };
}
const calls = () => (JSON.parse(document.querySelector('[data-testid=source-calls]')!.textContent!) as string[]).filter(call => call !== 'attach' && call !== 'detach');
function key(node: HTMLElement, type: string, value = ' ') { return node.dispatchEvent(new KeyboardEvent(type, { key: value, bubbles: true, cancelable: true })); }
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); });
for (const scenario of ['composite-custom', 'composite-native', 'composite-link', 'nested-custom']) it(`source composite inference activates Space on keydown exactly once (${scenario})`, async () => {
  const { button } = await setup(scenario); button.focus(); expect(document.activeElement).toBe(button);
  expect(key(button, 'keydown')).toBe(false); await tick(); expect(calls().filter(call => call === 'click')).toHaveLength(1);
  key(button, 'keyup'); await tick(); expect(calls().filter(call => call === 'click')).toHaveLength(1);
  expect(calls().indexOf('keydown')).toBeLessThan(calls().indexOf('click'));
});
for (const scenario of ['composite-menuitem', 'composite-option', 'composite-gridcell', 'composite-cancel']) it(`source text navigation/baseUI prevention cancels composite synthesis (${scenario})`, async () => {
  const { button } = await setup(scenario); key(button, 'keydown'); key(button, 'keyup'); await tick(); expect(calls().filter(call => call === 'click')).toHaveLength(0);
});
it('source composite switch retains source activation after native default prevention', async () => {
  const { button } = await setup('composite-switch'); key(button, 'keydown'); await tick(); expect(calls().filter(call => call === 'click')).toHaveLength(1); key(button, 'keyup'); await tick(); expect(calls().filter(call => call === 'click')).toHaveLength(1);
});
for (const scenario of ['composite-submit', 'composite-reset']) it(`source composite constructed click runs native form activation (${scenario})`, async () => {
  const { button } = await setup(scenario); key(button, 'keydown'); await tick(); expect(calls().filter(call => call === scenario.replace('composite-', ''))).toHaveLength(1); key(button, 'keyup'); await tick(); expect(calls().filter(call => call === scenario.replace('composite-', ''))).toHaveLength(1);
});
it('actual source buttonRef clears a render-host disabled override under Composite context', async () => {
  const { button } = await setup('override-disabled'); expect((button as HTMLButtonElement).disabled).toBe(false); expect(button.getAttribute('aria-disabled')).toBe('true'); button.focus(); expect(document.activeElement).toBe(button); key(button, 'keydown'); await tick(); expect(calls()).toEqual([]);
});
it('nested actual public Buttons publish the same host and clear both refs on teardown', async () => {
  const { component, button } = await setup('nested-disabled');
  expect(document.querySelector('[data-testid=source-ref]')!.textContent).toBe(button.id); expect(document.querySelector('[data-testid=source-inner-ref]')!.textContent).toBe(button.id);
  expect((button as HTMLButtonElement).disabled).toBe(false); key(button, 'keydown'); await tick(); expect(calls()).toEqual([]);
  const snapshot = (component as unknown as { snapshot(): { ref: HTMLElement | null; innerRef: HTMLElement | null; calls: string[] } }).snapshot;
  await unmount(mounted.pop()!); await tick(); expect(snapshot().ref).toBeNull(); expect(snapshot().innerRef).toBeNull(); expect(snapshot().calls.filter(call => call === 'detach')).toHaveLength(1);
});
it('native host attachment survives reactive disabled/class/style updates and same-host activation', async () => {
  const { button } = await setup('nested-disabled'); button.focus(); document.getElementById('enable-button')!.click(); await tick();
  expect(document.getElementById('source-button')).toBe(button); expect(button.hasAttribute('data-disabled')).toBe(false); expect(button.className).toContain('source-class'); expect(button.className).not.toContain('disabled'); expect(button.style.opacity).toBe('1'); expect(document.activeElement).toBe(button);
  key(button, 'keydown'); key(button, 'keyup'); await tick(); expect(calls().filter(call => call === 'click')).toHaveLength(1);
});

it('source native-mode mismatch warns on the actual host and excludes composite Space synthesis', async () => {
  const warning = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const { button } = await setup('native-mismatch'); expect(button.tagName).toBe('SPAN'); expect(warning).toHaveBeenCalledTimes(1);
    expect(warning.mock.calls[0]?.[0]).toContain('nativeButton'); key(button, 'keydown'); key(button, 'keyup'); await tick(); expect(calls().filter(call => call === 'click')).toHaveLength(0);
  } finally { warning.mockRestore(); }
});
