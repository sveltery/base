// Thin browser boundary to the actual pinned per-document test libraries.
import { test, type Locator, type Page } from '@playwright/test';
import type { NavigationMenuTestTransport } from '../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
type State = { navigationMenuTestTransport: NavigationMenuTestTransport };
test.afterEach(async ({ page }) => {
  await page.evaluate(async () => {
    await (window as unknown as State).navigationMenuTestTransport?.dispose();
  });
});
export async function waitTransport(page: Page) {
  await page.waitForFunction(() =>
    (window as unknown as State).navigationMenuTestTransport?.isReady(),
  );
}
export async function fire(
  target: Locator,
  event: string,
  init: Record<string, unknown> = {},
  relatedTestId?: string,
) {
  await target.evaluate(
    async (node, { event, init, relatedTestId }) => {
      if (relatedTestId)
        init.relatedTarget = document.querySelector(`[data-testid="${relatedTestId}"]`);
      await (window as unknown as State).navigationMenuTestTransport.fire(node, event, init);
    },
    { event, init, relatedTestId },
  );
}
export async function documentEvent(page: Page, event: string, init: Record<string, unknown> = {}) {
  await page.evaluate(
    async ({ event, init }) => {
      await (window as unknown as State).navigationMenuTestTransport.fire(document, event, init);
    },
    { event, init },
  );
}
export async function input(
  target: Locator,
  method: 'click' | 'hover' | 'unhover' | 'pointer',
  options: { releasePrevious?: boolean; pointerEventsCheck?: 0 } = {},
) {
  await target.evaluate(
    async (node, { method, options }) => {
      await (window as unknown as State).navigationMenuTestTransport.input(method, node, options);
    },
    { method, options },
  );
}
export async function key(page: Page, value: string) {
  await page.evaluate(async (value) => {
    const transport = (window as unknown as State).navigationMenuTestTransport;
    if (value === 'Tab' || value === 'Shift+Tab')
      await transport.input('tab', null, { shift: value === 'Shift+Tab' });
    else await transport.input('keyboard', null, { text: value === 'Space' ? ' ' : `{${value}}` });
  }, value);
}
export async function focus(target: Locator) {
  await target.evaluate(async (node) => {
    await (window as unknown as State).navigationMenuTestTransport.mutate(() =>
      (node as HTMLElement).focus(),
    );
  });
}
export async function advance(page: Page, milliseconds: number) {
  await page.evaluate(() => (window as unknown as State).navigationMenuTestTransport.beginClock());
  try {
    await page.clock.runFor(milliseconds);
  } finally {
    await page.evaluate(() => (window as unknown as State).navigationMenuTestTransport.endClock());
  }
}
