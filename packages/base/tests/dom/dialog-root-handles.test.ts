// Native lifecycle supplements; complete browser body accounting remains separate.
// MIT: parity/dialog/UPSTREAM_LICENSE; immutable47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/DialogRootHandlesFixture.svelte';
const instances: ReturnType<typeof mount>[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 70)); await tick(); }
afterEach(async () => { for (const instance of instances.splice(0)) await unmount(instance); document.body.replaceChildren(); });
for (const variant of ['contained', 'detached', 'multiple'] as const) it(`reopened nonmodal ${variant} Root accepts the pinned virtual outside click`, async () => {
  const host = document.createElement('section'); document.body.append(host);
  instances.push(mount(Fixture, { target: host, props: { line: 280, variant } })); await settle();
  const trigger = document.querySelector<HTMLElement>('[data-testid=trigger]')!;
  trigger.click(); await settle(); expect(document.querySelector('[role=dialog]')).not.toBeNull();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await settle(); expect(document.querySelector('[role=dialog]')).toBeNull();
  trigger.click(); await settle(); expect(document.querySelector('[role=dialog]')).not.toBeNull();
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })); await settle(); expect(document.querySelector('[role=dialog]')).toBeNull();
});
