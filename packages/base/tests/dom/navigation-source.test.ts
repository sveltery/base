// Source selections and authored supplements; MIT: parity/toggle-toolbar/UPSTREAM_LICENSE.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/NavigationFixture.svelte';
import { reset } from '@sveltery/utils/error';
const mounted: ReturnType<typeof mount>[] = [];
async function setup(scenario: string, orientation: 'horizontal' | 'vertical' = 'horizontal') {
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario, orientation } }); mounted.push(component); await tick();
  return component;
}
const node = (id: string) => document.getElementById(id)!;
function calls() { return JSON.parse(document.querySelector('[data-testid=calls]')!.textContent!); }
function selected() { return ['one', 'two', 'three'].filter(id => node(id).getAttribute('aria-pressed') === 'true'); }
async function click(id: string) { node(id).click(); await tick(); }
async function action(name: string) { Array.from(document.querySelectorAll('button')).find(node => node.textContent === name)!.click(); await tick(); }
async function key(id: string, key: string) { node(id).focus(); node(id).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); await tick(); await tick(); }
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); reset(); vi.restoreAllMocks(); });
it('Source single group uses original own-before-group details then exclusive setter', async () => {
  await setup('group-default'); expect(selected()).toEqual(['two']);
  await click('one'); expect(selected()).toEqual(['one']);
  expect(calls().map((x: { part: string; same: boolean; before: string; value: unknown }) => [x.part, x.value, x.same, x.before])).toEqual([['toggle', true, true, 'false'], ['group', ['one'], true, 'false']]);
  await click('one'); expect(selected()).toEqual([]);
});
for (const scenario of ['group-cancel-own', 'group-cancel-group', 'group-prevent-handler', 'group-prevent-default']) it(`Source cancellation ${scenario}`, async () => {
  await setup(scenario); await click('one'); expect(selected()).toEqual(scenario === 'group-prevent-default' ? ['one'] : []);
  expect(calls().length).toBe(scenario === 'group-prevent-handler' ? 0 : scenario === 'group-cancel-own' ? 1 : 2);
});
it('Source multiple setter retains array order, deselects and switches to single', async () => {
  await setup('group-multiple'); await click('two'); expect(selected()).toEqual(['one', 'two']); expect(calls()[1].value).toEqual(['one', 'two']);
  await click('one'); expect(selected()).toEqual(['two']); await action('Change multiple');
  expect(node('selection-group').hasAttribute('data-multiple')).toBe(false); await click('three'); expect(selected()).toEqual(['three']);
});
for (const scenario of ['group-controlled', 'group-controlled-accept']) it(`Source ${scenario} requests await owner`, async () => {
  await setup(scenario); await click('one'); expect(selected()).toEqual(scenario.includes('accept') ? ['one'] : ['two']);
  await action('Change owner'); expect(selected()).toEqual(scenario.includes('accept') ? ['two'] : ['one']);
});
it('Source absent/empty values become distinct generated group identities', async () => {
  await setup('group-omitted'); await click('one'); await click('two'); expect(selected()).toEqual(['two']);
  const groups = calls().filter((x: { part: string }) => x.part === 'group');
  expect(groups[0].value[0]).toMatch(/^base-ui-/); expect(groups[1].value[0]).toMatch(/^base-ui-/); expect(groups[0].value[0]).not.toBe(groups[1].value[0]);
});
it('Source only initialized missing values log the exact de-duplicated diagnostic', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  await setup('group-warning'); expect(error).toHaveBeenCalledExactlyOnceWith('Base UI: A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop. This will cause issues between the Toggle Group and Toggle values. Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.');
});
it('Source stand-alone Home/End and Toolbar group sharing use their real composite roots', async () => {
  await setup('group-single'); await key('one', 'End'); expect(document.activeElement).toBe(node('three')); await key('three', 'Home'); expect(document.activeElement).toBe(node('one'));
});
it('Source Toolbar shares one list across before/group/after and skips direct disabled Toggle metadata', async () => {
  await setup('toolbar-toggles'); await key('before', 'ArrowRight'); expect(document.activeElement).toBe(node('one'));
  await action('Change disabled'); expect((node('two') as HTMLButtonElement).disabled).toBe(true);
  await key('one', 'ArrowRight'); expect(document.activeElement).toBe(node('three')); await key('three', 'ArrowRight'); expect(document.activeElement).toBe(node('after'));
});
it('Source Toolbar disabledIndices updates eligible tab stop from item metadata', async () => {
  await setup('toolbar-metadata'); expect(node('one').getAttribute('tabindex')).toBe('-1'); expect(node('link').getAttribute('tabindex')).toBe('0');
  await key('link', 'ArrowRight'); expect(document.activeElement).toBe(node('three')); await action('Change focusable');
  expect((node('two') as HTMLButtonElement).disabled).toBe(false); await key('link', 'ArrowRight'); expect(document.activeElement).toBe(node('two'));
});
it('Source outer Toolbar.Button retains shared host navigation over inner Toggle', async () => {
  await setup('toolbar-wrapped-disabled');
  for (const id of ['one', 'two', 'three']) { expect((node(id) as HTMLButtonElement).disabled).toBe(false); expect(node(id).getAttribute('aria-disabled')).toBe('true'); }
  await key('one', 'ArrowRight'); expect(document.activeElement).toBe(node('two')); await click('two'); expect(calls()).toEqual([]);
});
it('Source nearest nested Group does not inherit outer Group disabled state', async () => {
  await setup('toolbar-nested-groups'); expect(node('outer-button').getAttribute('aria-disabled')).toBe('true'); expect(node('inner-button').getAttribute('aria-disabled')).toBe('false');
});
it('Source Input cancels checkbox native default while disabled then enables', async () => {
  await setup('toolbar-input-checkbox'); await click('tested-input'); expect((node('tested-input') as HTMLInputElement).checked).toBe(false);
  await action('Enable input'); await click('tested-input'); expect((node('tested-input') as HTMLInputElement).checked).toBe(true);
});
it('Source disabled nonfocusable Input remains a native input but is excluded by metadata', async () => {
  await setup('toolbar-input-skip'); expect((node('tested-input') as HTMLInputElement).disabled).toBe(false);
  await key('before', 'ArrowRight'); expect(document.activeElement).toBe(node('after'));
});
for (const orientation of ['horizontal', 'vertical'] as const) it(`Source Separator opposite ${orientation} toolbar and caller override`, async () => {
  await setup('toolbar-roving', orientation); expect(node('separator').getAttribute('aria-orientation')).toBe(orientation === 'horizontal' ? 'vertical' : 'horizontal');
});
it('native attachment/ref cleanup follows the real Input host without a Field wrapper', async () => {
  const component = await setup('toolbar-input-text'); const input = node('tested-input');
  expect(component.snapshot()).toEqual({ ref: input, attached: 1, detached: 0 });
  await action('Toggle mount'); expect(component.snapshot()).toEqual({ ref: null, attached: 1, detached: 1 });
  await action('Toggle mount'); expect((node('tested-input') as HTMLInputElement).value).toBe('abcd'); expect(component.snapshot().attached).toBe(2);
});
