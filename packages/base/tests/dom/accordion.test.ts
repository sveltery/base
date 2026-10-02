// Ordinary assertion ports from Base UI v1.8.0; see parity/accordion/upstream-inventory.json.
// MIT: parity/accordion/UPSTREAM_LICENSE. Supplements earn no ordinary declaration credit.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { Accordion } from '../../src/lib/accordion/index.js';
import Fixture from './accordion/Fixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
async function setup(scenario = 'default') {
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario } }); mounted.push(component); await tick();
  return { component, trigger: get('trigger1')! as HTMLButtonElement };
}
function get(part: string) { return document.querySelector(`[data-testid=${part}]`) as HTMLElement | null; }
async function settle() { await tick(); for (let frame = 0; frame < 2; frame++) { await new Promise<void>(resolve => requestAnimationFrame(() => resolve())); await tick(); } }
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); vi.restoreAllMocks(); });

it('I:9 throws when rendered outside an Accordion.Root', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const target = document.createElement('section'); document.body.append(target);
  expect(() => mount(Accordion.Item, { target })).toThrow('Base UI: AccordionRootContext is missing. Accordion parts must be placed within <Accordion.Root>.');
});
it('H:8 throws when rendered outside an Accordion.Item', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const target = document.createElement('section'); document.body.append(target);
  expect(() => mount(Accordion.Header, { target })).toThrow('Base UI: AccordionItemContext is missing. Accordion parts must be placed within <Accordion.Item>.');
});
it('R:19 warns when hiddenUntilFound overrides keepMounted={false}', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); await setup('root-warning');
  expect(warn).toHaveBeenCalledWith('Base UI: The `keepMounted={false}` prop on `Accordion.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed.');
  expect(get('panel1')!.getAttribute('hidden')).toBe('until-found');
});
it('R:41 renders correct ARIA attributes', async () => {
  const { trigger } = await setup('aria'); const panel = get('panel1')!;
  expect(trigger.hasAttribute('aria-controls')).toBe(true);
  expect(panel.id).toBe(trigger.getAttribute('aria-controls'));
  expect(panel.getAttribute('role')).toBe('region');
  expect(trigger.id).toBe(panel.getAttribute('aria-labelledby'));
});
it('R:62 references manual panel id in trigger aria-controls', async () => {
  const { trigger } = await setup('manual-panel');
  expect(trigger.getAttribute('aria-controls')).toBe('custom-panel-id'); expect(get('panel1')!.id).toBe('custom-panel-id');
});
it('R:81 references manual trigger id in panel aria-labelledby', async () => {
  await setup('manual-trigger'); expect(get('panel1')!.getAttribute('aria-labelledby')).toBe('custom-trigger-id');
});
it('R:98 updates panel labeling when a manual trigger id is added or changed', async () => {
  const { trigger, component } = await setup('changing-id'); const panel = get('panel1')!;
  expect(trigger.hasAttribute('id')).toBe(true); expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
  component.setTriggerId('custom-trigger-id-1'); await tick();
  expect(trigger.id).toBe('custom-trigger-id-1'); expect(panel.getAttribute('aria-labelledby')).toBe('custom-trigger-id-1');
  component.setTriggerId('custom-trigger-id-2'); await tick();
  expect(trigger.id).toBe('custom-trigger-id-2'); expect(panel.getAttribute('aria-labelledby')).toBe('custom-trigger-id-2');
});
it('R:145 restores panel labeling when a manual trigger id is removed', async () => {
  const { trigger, component } = await setup('removing-id'); const panel = get('panel1')!;
  expect(panel.getAttribute('aria-labelledby')).toBe('custom-trigger-id'); component.setTriggerId(undefined); await tick();
  expect(trigger.hasAttribute('id')).toBe(true); expect(trigger.id).not.toBe('custom-trigger-id'); expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
});
it('R:182 unregisters generated part ids when the trigger or panel unmounts', async () => {
  const { component } = await setup('parts'); component.setParts('panel'); await tick(); expect(get('panel1')!.hasAttribute('aria-labelledby')).toBe(false);
  component.setParts('both'); await tick(); expect(get('panel1')!.getAttribute('aria-labelledby')).toBe(get('trigger1')!.id);
  component.setParts('trigger'); await tick(); expect(get('trigger1')!.hasAttribute('aria-controls')).toBe(false);
  component.setParts('both'); await tick(); expect(get('trigger1')!.getAttribute('aria-controls')).toBe(get('panel1')!.id);
});
for (const [line, scenario] of [[282, 'custom-default'], [342, 'custom-controlled']] as const) it(`R:${line} custom item value`, async () => {
  await setup(scenario); expect(get('panel1')).not.toBe(null); expect(get('panel1')!.hidden).toBe(false);
  expect(get('panel1')!.hasAttribute('data-open')).toBe(true); expect(get('panel2')).toBe(null);
});
it('R:370 can disable the whole accordion', async () => {
  await setup('disabled-root');
  for (const part of ['item1', 'header1', 'trigger1', 'panel1', 'item2', 'header2', 'trigger2']) expect(get(part)!.hasAttribute('data-disabled')).toBe(true);
});
it('R:399 can disable one accordion item', async () => {
  await setup('disabled-item');
  for (const part of ['item1', 'header1', 'trigger1', 'panel1']) expect(get(part)!.hasAttribute('data-disabled')).toBe(true);
  for (const part of ['item2', 'header2', 'trigger2']) expect(get(part)!.hasAttribute('data-disabled')).toBe(false);
});
for (const part of ['root', 'item']) it(`parameterized R:431 ${part} disabled suppresses click and key activation`, async () => {
  const { trigger, component } = await setup(`disabled-${part}-closed`); trigger.click(); trigger.focus();
  for (const key of [' ', 'Enter']) { trigger.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); trigger.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true })); }
  await tick(); expect(trigger.getAttribute('aria-expanded')).toBe('false'); expect(get('panel1')).toBe(null);
  expect(component.snapshot().values).toHaveLength(0); expect(component.snapshot().opens).toHaveLength(0);
});
it('R:473 allows onMouseUp to call preventBaseUIHandler on the trigger', async () => {
  const { trigger } = await setup('mouseup'); expect(() => trigger.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))).not.toThrow();
});
for (const [line, scenario, calls] of [[593, 'cancel-item', 0], [623, 'cancel-root', 1], [674, 'cancel-item-controlled', 0], [704, 'cancel-controlled', 1], [742, 'cancel-multiple', 1]] as const) it(`R:${line} cancellation prevents opening`, async () => {
  const { trigger, component } = await setup(scenario); trigger.click(); await tick();
  expect(trigger.getAttribute('aria-expanded')).toBe('false'); expect(get('panel1')).toBe(null); expect(component.snapshot().values).toHaveLength(calls);
});
it('R:648 onValueChange cancel() prevents closing while uncontrolled', async () => {
  const { trigger, component } = await setup('cancel-close'); trigger.click(); await tick();
  expect(trigger.getAttribute('aria-expanded')).toBe('true'); expect(get('panel1')!.hasAttribute('data-open')).toBe(true);
  expect(component.snapshot().values).toHaveLength(1); expect(component.snapshot().values.at(-1)!.value).toEqual([]);
});
it('R:767 onValueChange cancel() prevents closing while multiple', async () => {
  const { trigger, component } = await setup('cancel-multiple-close'); trigger.click(); await tick();
  expect(trigger.getAttribute('aria-expanded')).toBe('true'); expect(get('panel1')).not.toBe(null); expect(component.snapshot().values).toHaveLength(1);
});
it('P:31 warns when a panel enables hiddenUntilFound and disables keepMounted', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); await setup('panel-warning');
  expect(warn).toHaveBeenCalledWith('Base UI: The `keepMounted={false}` prop on an `Accordion.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed.');
  expect(get('panel1')!.getAttribute('hidden')).toBe('until-found');
});
it('P:97 passes root keepMounted to closed panels', async () => {
  await setup('root-keep'); expect(get('panel1')!.hasAttribute('hidden')).toBe(true);
});
it('P:112 passes root hiddenUntilFound to closed panels and allows panel overrides', async () => {
  await setup('root-hidden'); expect(get('panel1')!.getAttribute('hidden')).toBe('until-found'); expect(get('panel2')).toBe(null);
});
it('supplement: item callback runs before root callback with the same live details', async () => {
  const { trigger, component } = await setup(); trigger.click(); await tick(); const snapshot = component.snapshot();
  expect(snapshot.order).toEqual(['item', 'root']); expect(snapshot.opens[0].details).toBe(snapshot.values[0].details);
  expect(snapshot.values[0].details.reason).toBe('trigger-press'); expect(snapshot.values[0].details.event).toBeInstanceOf(MouseEvent);
  expect(snapshot.values[0].value).toEqual([0]);
});
it('supplement: controlled requests await owner updates', async () => {
  const { trigger, component } = await setup('controlled'); trigger.click(); await tick();
  expect(component.snapshot().values[0].value).toEqual([0]); expect(trigger.getAttribute('aria-expanded')).toBe('false');
  component.setValue([0]); await settle(); expect(trigger.getAttribute('aria-expanded')).toBe('true');
});
it('supplement: missing animation API completes closing and Item opening never reports hidden=true', async () => {
  const { trigger, component } = await setup(); trigger.click(); await settle(); expect(get('panel1')).not.toBe(null);
  expect(component.snapshot().states.some(state => state.open && state.hidden)).toBe(false);
  trigger.click(); await settle(); expect(get('panel1')).toBe(null);
});
