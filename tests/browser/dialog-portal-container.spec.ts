// Supplemental paired fidelity probes; no upstream declaration credit.
import { test, expect } from '@playwright/test';
for (const reference of [false, true])
  for (const scenario of [
    'undefined',
    'null',
    'null-ref',
    'element',
    'element-current',
    'ref-owner-document',
    'shadow',
    'iframe',
  ]) {
    test(`Dialog.Portal reference=${reference} resolves ${scenario}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`/dialog-portal-container?case=${scenario}${reference ? '&reference' : ''}`);
      await expect(page.locator('main[data-hydrated]')).toHaveAttribute('data-hydrated', 'true');
      const portal =
        scenario === 'iframe'
          ? page.frameLocator('iframe').getByTestId('container-portal')
          : page.getByTestId('container-portal');
      if (scenario === 'null') await expect(portal).toHaveCount(0);
      else {
        await expect(portal).toHaveCount(1);
        expect(
          await portal.evaluate((node) =>
            node.parentNode instanceof ShadowRoot
              ? 'shadow'
              : (node.parentNode as HTMLElement).id || (node.parentNode as HTMLElement).tagName,
          ),
        ).toBe(
          scenario === 'shadow'
            ? 'shadow'
            : scenario === 'iframe'
              ? 'foreign-destination'
              : ['undefined', 'null-ref'].includes(scenario)
                ? 'BODY'
                : 'portal-destination',
        );
      }
      if (!reference) {
        await page.getByRole('button', { name: 'Remove portal', exact: true }).click();
        await expect(portal).toHaveCount(0);
      }
      expect(errors).toEqual([]);
    });
  }
