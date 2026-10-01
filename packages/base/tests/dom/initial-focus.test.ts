import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InitialFocusFixture.svelte';
// Actual component wiring companion to browser leaf ports. No browser parity credit.
const mounted: ReturnType<typeof mount>[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 60)); await tick(); }
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); });
for (const scenario of ['ref', 'true', 'null', 'count']) it(`initialFocus ${scenario} on mounted Svelte parts`, async () => {
  const host = document.createElement('section'); document.body.append(host);
  const counts: number[] = [];
  mounted.push(mount(Fixture, { target: host, props: { scenario, record: count => counts.push(count) } }));
  await settle();
  const trigger = host.querySelector('button')!;
  trigger.click(); await settle();
  expect(document.activeElement).toBe(document.querySelector(`[data-testid="${scenario === 'ref' || scenario === 'count' ? 'input-2' : 'input-1'}"]`));
  if (scenario === 'count') {
    expect(counts).toEqual([1]);
    document.querySelector<HTMLButtonElement>('[role=dialog] button')!.click(); await settle();
    expect(document.activeElement).toBe(trigger);
    expect(counts).toEqual([1]);
  }
});
