// Live business registration regression; authored actual native component coverage, zero Original credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NativeMenuLabelFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
async function settle() { flushSync(); await tick(); await new Promise(resolve => setTimeout(resolve, 70)); flushSync(); }
afterEach(async () => { for (const app of mounted.splice(0)) await unmount(app); document.body.replaceChildren(); });
for (const part of ['item', 'link', 'checkbox', 'radio'] as const)
  it(`uses an updated ${part} label for actual typeahead without replacing the host`, async () => {
    const target = document.createElement('main'); document.body.append(target);
    const app = mount(Fixture, { target, props: { part } }); mounted.push(app); await settle();
    const first = document.getElementById('native-label-first')!;
    const item = document.getElementById('native-label-target')!;
    app.setLabel('Zulu'); await settle();
    expect(document.getElementById('native-label-target')).toBe(item); expect(item.textContent).toBe('Dynamic item');
    first.focus(); first.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true })); await settle();
    expect(document.activeElement).toBe(item);
  });
