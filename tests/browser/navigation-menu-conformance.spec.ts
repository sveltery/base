// Source selected helper assertions, separate from ordinary family declaration credit (MIT).
import { expect, test, type Page } from '@playwright/test';
type RefSnapshot = {
  refAInstance: boolean;
  refATag: string | null;
  refBTag: string | null;
  sameRef: boolean;
  refATestId: string | null;
  refBTestId: string | null;
};
const parts = {
  Root: 'HTMLElement',
  List: 'HTMLUListElement',
  Item: 'HTMLLIElement',
  Icon: 'HTMLSpanElement',
  Link: 'HTMLAnchorElement',
  Trigger: 'HTMLButtonElement',
  Portal: 'HTMLDivElement',
  Positioner: 'HTMLDivElement',
  Popup: 'HTMLElement',
  Backdrop: 'HTMLDivElement',
  Arrow: 'HTMLDivElement',
  Viewport: 'HTMLDivElement',
} as const;
async function snapshot(page: Page, instance = 'HTMLElement') {
  return page.evaluate(
    (instance) =>
      (
        window as unknown as {
          navigationMenuConformance: { snapshot(instance: string): RefSnapshot };
        }
      ).navigationMenuConformance.snapshot(instance),
    instance,
  );
}
for (const reference of [false, true])
  for (const [part, instance] of Object.entries(parts)) {
    test.describe(`${reference ? 'Original React' : 'native Svelte'} ${part} conformance`, () => {
      async function visit(page: Page, probe: string) {
        await page.goto(
          `/navigation-menu/conformance?part=${part}&probe=${probe}${reference ? '&reference' : ''}`,
        );
        await page.waitForFunction(() =>
          Boolean(
            (window as unknown as { navigationMenuConformance?: unknown })
              .navigationMenuConformance,
          ),
        );
      }
      for (const probe of ['props-default', 'props-custom-function', 'props-custom-element'])
        test(probe, async ({ page }) => {
          await visit(page, probe);
          const host = page.getByTestId(probe === 'props-default' ? 'root' : 'custom-root');
          await expect(host).toHaveAttribute('lang', 'fr');
          await expect(host).toHaveAttribute('data-foobar', 'conformance-token');
        });
      for (const probe of ['style-component', 'style-custom-function', 'style-custom-element'])
        test(probe, async ({ page }) => {
          await visit(page, probe);
          const host = page.getByTestId(probe === 'style-component' ? 'root' : 'custom-root');
          await expect(host).toHaveAttribute('style');
          expect(await host.getAttribute('style')).toContain('color: green');
        });
      test('default forwarded ref', async ({ page }) => {
        await visit(page, 'ref-default');
        expect((await snapshot(page, instance)).refAInstance).toBe(true);
      });
      test('class string', async ({ page }) => {
        await visit(page, 'class');
        await expect(page.locator('.test-class')).toHaveCount(1);
      });
      for (const probe of ['render-function', 'render-element', 'render-element-empty'])
        test(probe, async ({ page }) => {
          await visit(page, probe);
          await expect(page.getByTestId('base-ui-wrapper')).toHaveCount(1);
          if (probe !== 'render-element-empty') {
            await expect(page.getByTestId('wrapped')).toHaveCount(1);
            await expect(page.getByTestId('wrapped')).toHaveAttribute(
              'data-test-value',
              'conformance-token',
            );
          }
        });
      test('custom forwarded ref', async ({ page }) => {
        await visit(page, 'render-ref-function');
        const state = await snapshot(page);
        expect(state.refATag).toBe('DIV');
        expect(state.refATestId).toBe('wrapped');
      });
      test('custom element merges refs', async ({ page }) => {
        await visit(page, 'render-ref-merge');
        const state = await snapshot(page);
        expect(state.refATag).toBe('DIV');
        expect(state.refATestId).toBe('wrapped');
        expect(state.refBTag).toBe('DIV');
        expect(state.refBTestId).toBe('wrapped');
      });
      for (const [probe, componentClass] of [
        ['render-class', 'component-classname'],
        ['render-class-function', 'conditional-component-classname'],
      ])
        test(probe, async ({ page }) => {
          await visit(page, probe);
          const host = page.getByTestId('wrapped');
          expect(
            await host.evaluate((node, name) => node.classList.contains(name), componentClass),
          ).toBe(true);
          expect(
            await host.evaluate((node) => node.classList.contains('render-prop-classname')),
          ).toBe(true);
        });
    });
  }
// Content's Original describeConformance.skip is retained in the declaration ledger.
