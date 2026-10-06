// Native ClassValue supplements with React string-class comparator. No leaf parity credit.
import { expect, test } from '@playwright/test';
for (const reference of [true, false])
  for (const kind of ['object', 'array', 'object-callback', 'array-callback']) {
    test(`${reference ? 'React string comparator' : 'Svelte ClassValue'} Input replacement class ${kind}`, async ({
      page,
    }) => {
      await page.goto(
        `/input?case=conformance-render-class-${kind}${reference ? '&reference' : ''}`,
      );
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      const node = page.getByTestId('test-component');
      const initial = [
        'render-prop-classname',
        'object-class',
        ...(kind.includes('array') ? ['nested-class'] : []),
        kind.includes('callback') ? 'enabled-class' : 'component-classname',
      ];
      expect(await node.evaluate((element) => [...element.classList].sort())).toEqual(
        initial.sort(),
      );
      if (kind.includes('callback')) {
        await page.getByRole('button', { name: 'Toggle disabled class', exact: true }).click();
        await expect(node).toHaveClass(/disabled-class/);
        await expect(node).not.toHaveClass(/enabled-class/);
        await expect(node).toHaveClass(/render-prop-classname/);
        await expect(node).toHaveClass(/object-class/);
        if (kind.includes('array')) await expect(node).toHaveClass(/nested-class/);
      }
    });
  }
