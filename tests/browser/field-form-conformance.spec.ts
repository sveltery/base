// Original helper meanings, separately uncredited. Immutable sources/hashes/guards in parity/field-form/conformance.json.
// MIT: parity/field-form/UPSTREAM_LICENSE. Every helper invocation has 15 distinct source declaration sites.
import { expect, test } from '@playwright/test';
const parts = [
  'Field.Root',
  'Field.Control',
  'Field.Label',
  'Field.Description',
  'Field.Error',
  'Field.Item',
  'Fieldset.Root',
  'Fieldset.Legend',
  'Form',
];
const scenarios = [
  'props-default',
  'props-function',
  'props-element',
  'props-style',
  'props-style-function',
  'props-style-element',
  'ref',
  'render-function',
  'render-element',
  'render-empty-element',
  'render-ref',
  'render-merge-ref',
  'render-class',
  'render-class-resolved',
  'class',
];
for (const reference of [false, true])
  for (const part of parts)
    for (const scenario of scenarios)
      test(`${reference ? 'React' : 'Svelte'} ${part} uncredited conformance ${scenario}`, async ({
        page,
      }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(
          `/field-form-conformance?part=${encodeURIComponent(part)}&case=${scenario}${reference ? '&reference' : ''}`,
        );
        await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
        if (['props-default', 'props-function', 'props-element'].includes(scenario)) {
          const root = page.getByTestId(scenario === 'props-default' ? 'root' : 'custom-root');
          await expect(root).toHaveAttribute('lang', 'fr');
          await expect(root).toHaveAttribute('data-foobar', 'source-value');
        } else if (scenario.includes('style')) {
          await expect(page.getByTestId('custom-root')).toHaveAttribute('style');
          expect(await page.getByTestId('custom-root').getAttribute('style')).toContain(
            'color: green',
          );
        } else if (scenario === 'ref') {
          expect(JSON.parse((await page.getByTestId('refs').textContent()) ?? '{}').native).toBe(
            true,
          );
        } else if (scenario.includes('class')) {
          const root =
            scenario === 'class' ? page.locator('.test-class') : page.getByTestId('test-component');
          await expect(root).toHaveCount(1);
          if (scenario !== 'class') {
            await expect(root).toHaveClass(
              new RegExp(
                scenario.endsWith('resolved')
                  ? 'conditional-component-classname'
                  : 'component-classname',
              ),
            );
            await expect(root).toHaveClass(/render-prop-classname/);
          }
        } else {
          await expect(page.getByTestId('base-ui-wrapper')).toHaveCount(1);
          if (scenario !== 'render-empty-element') {
            await expect(page.getByTestId('wrapped')).toHaveCount(1);
            if (['render-function', 'render-element'].includes(scenario))
              await expect(page.getByTestId('wrapped')).toHaveAttribute(
                'data-test-value',
                'source-value',
              );
          }
          if (scenario === 'render-ref' || scenario === 'render-merge-ref') {
            const expectedTag = part === 'Field.Label' ? 'LABEL' : 'DIV';
            const refs = JSON.parse((await page.getByTestId('refs').textContent()) ?? '{}');
            expect(refs.tag).toBe(expectedTag);
            expect(refs.testid).toBe('wrapped');
            if (scenario === 'render-merge-ref') {
              expect(refs.present).toBe(true);
              expect(refs.renderPresent).toBe(true);
              expect(refs.renderTag).toBe(expectedTag);
              expect(refs.renderTestid).toBe('wrapped');
            }
          }
        }
        expect(errors).toEqual([]);
      });
