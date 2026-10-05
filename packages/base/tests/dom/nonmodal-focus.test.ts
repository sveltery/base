import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/NonmodalFocusFixture.svelte';
import { mountNonmodalFocusReference } from '../../../../apps/fixtures/src/lib/nonmodal-focus-reference.js';
// Actual-component event/lifecycle diagnostics; trusted Tab evidence belongs to hosted Chromium.
const cleanup: (() => void | Promise<void>)[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 60)); await tick(); }
function element(id: string) { return document.getElementById(id)!; }
function requests() { return JSON.parse(document.querySelector('[data-testid=requests]')!.textContent!); }
async function setup(reference: boolean, scenario = 'ordinary') {
  const host = document.createElement('section'); document.body.append(host);
  if (reference) cleanup.push(mountNonmodalFocusReference(host, scenario));
  else { const component = mount(Fixture, { target: host, props: { scenario } }); cleanup.push(() => unmount(component)); }
  await settle(); element('nonmodal-a').focus(); element('nonmodal-a').click(); await settle();
}
afterEach(async () => { for (const stop of cleanup.splice(0)) await stop(); document.body.replaceChildren(); });
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  it(`${framework}: Portal capture restores tabindex before an inside guard chooses its next target`, async () => {
    await setup(reference);
    element('after').focus(); await settle();
    expect(element('first').tabIndex).toBe(-1);
    expect(element('last').tabIndex).toBe(-1);
    const beforeOutside = document.querySelector<HTMLElement>('[data-base-ui-focus-guard][data-type=outside]')!;
    beforeOutside.focus(); await settle();
    expect(document.activeElement).toBe(element('first'));
    expect(element('first').tabIndex).toBe(0);
    expect(element('last').tabIndex).toBe(0);
    expect(requests()).toHaveLength(1);
  });
  it(`${framework}: programmatic Popup exit and unrelated outside focus retain the logical tree`, async () => {
    await setup(reference); element('first').focus(); element('after').focus(); await settle();
    expect(document.querySelector('[role=dialog]')).not.toBeNull(); expect(requests()).toHaveLength(1);
    element('end').focus(); await settle();
    expect(document.querySelector('[role=dialog]')).not.toBeNull(); expect(requests()).toHaveLength(1);
  });
  for (const scenario of ['ordinary', 'entry', 'disabled', 'stop-blur']) it(`${framework}: owning Trigger focusout uses native target/relatedTarget (${scenario})`, async () => {
    await setup(reference, scenario); element('nonmodal-a').focus(); element('after').focus(); await settle();
    expect(!!document.querySelector('[role=dialog]')).toBe(scenario === 'disabled');
    if (scenario === 'disabled') expect(requests()).toHaveLength(1);
    else {
      expect(requests()).toHaveLength(2);
      expect(requests().at(-1)).toMatchObject({ open: false, reason: 'focus-out', trigger: 'nonmodal-a', type: 'focusout', target: 'nonmodal-a', related: 'after' });
      expect(document.activeElement).toBe(element('after'));
    }
  });
  for (const target of ['first', 'nonmodal-a']) it(`${framework}: null relatedTarget does not dismiss (${target})`, async () => {
    await setup(reference); element(target).focus(); element(target).blur(); await settle();
    expect(document.querySelector('[role=dialog]')).not.toBeNull(); expect(requests()).toHaveLength(1);
  });
  it(`${framework}: another registered Trigger remains inside but its own blur is not the owner's`, async () => {
    await setup(reference, 'multiple'); element('first').focus(); element('nonmodal-b').focus(); await settle();
    expect(requests()).toHaveLength(1); element('after').focus(); await settle();
    expect(document.querySelector('[role=dialog]')).not.toBeNull(); expect(requests()).toHaveLength(1);
  });
  it(`${framework}: conditional Portal removal cleans every guard`, async () => {
    await setup(reference);
    (document.querySelector('main') as HTMLElement & { nonmodalCommand(command: string): void }).nonmodalCommand('remove'); await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull();
    expect(document.querySelectorAll('[data-base-ui-focus-guard],[data-tabindex]')).toHaveLength(0);
  });
}
