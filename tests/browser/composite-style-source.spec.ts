// Actual browser helper supplements, not upstream declaration/assertion parity.
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('null-defaultView visibility uses the actual pinned canonical fallback', async ({ page }) => {
  const observation = await page.evaluate(async () => {
    const url = '/src/compositeStyleProbe.ts';
    const helpers = await import(url);
    const foreign = document.implementation.createHTMLDocument('Composite style realm');
    const button = foreign.createElement('button');
    foreign.body.append(button);
    const pairs = [];
    for (const display of ['inline-block', 'none', 'contents']) {
      button.style.display = display;
      pairs.push([
        helpers.originalVisible(button),
        helpers.nativeVisible(button),
        helpers.originalDisabled([button], 0),
        helpers.nativeDisabled([button], 0),
      ]);
    }
    return { noWindow: foreign.defaultView === null, connected: button.isConnected, pairs };
  });
  expect(observation.noWindow).toBe(true);
  expect(observation.connected).toBe(true);
  // Chromium's checkVisibility and windowless computed styles remain authoritative.
  for (const [
    originalVisible,
    nativeVisible,
    originalDisabled,
    nativeDisabled,
  ] of observation.pairs) {
    expect(nativeVisible).toBe(originalVisible);
    expect(nativeDisabled).toBe(originalDisabled);
  }
});

test('supplied styles and checkVisibility retain pinned precedence on real hosts', async ({
  page,
}) => {
  const observation = await page.evaluate(async () => {
    const url = '/src/compositeStyleProbe.ts';
    const helpers = await import(url);
    const button = document.createElement('button');
    document.body.append(button);
    const visible = [helpers.originalVisible(button), helpers.nativeVisible(button)];
    button.style.display = 'none';
    const hidden = [helpers.originalVisible(button), helpers.nativeVisible(button)];
    button.style.display = 'inline-block';
    button.disabled = true;
    const disabled = [helpers.originalDisabled([button], 0), helpers.nativeDisabled([button], 0)];
    const styles = getComputedStyle(button);
    Object.defineProperty(button, 'checkVisibility', { value: () => false });
    const authoritative = [
      helpers.originalVisible(button, styles),
      helpers.nativeVisible(button, styles),
    ];
    button.remove();
    return { visible, hidden, disabled, authoritative };
  });
  expect(observation.visible).toEqual([true, true]);
  expect(observation.hidden).toEqual([false, false]);
  expect(observation.disabled).toEqual([true, true]);
  expect(observation.authoritative).toEqual([false, false]);
});

test('scrolling retains the distinct global lookup in windowed and windowless documents', async ({
  page,
}) => {
  const observations = await page.evaluate(async () => {
    const url = '/src/compositeStyleProbe.ts';
    const helpers = await import(url);
    const results = [];
    for (const owner of [document, document.implementation.createHTMLDocument('scroll realm')]) {
      const container = owner.createElement('div');
      const button = owner.createElement('button');
      owner.body.append(container);
      container.append(button);
      container.style.scrollPaddingRight = '5px';
      button.style.scrollMarginRight = '3px';
      Object.defineProperties(container, {
        clientWidth: { value: 60 },
        scrollWidth: { value: 200 },
        clientHeight: { value: 60 },
        scrollHeight: { value: 60 },
      });
      Object.defineProperties(button, {
        offsetLeft: { value: 80 },
        offsetWidth: { value: 20 },
        offsetParent: { value: container },
        scrollTo: { value: () => undefined },
      });
      const calls: ScrollToOptions[] = [];
      container.scrollTo = (options?: ScrollToOptions | number) => {
        if (typeof options === 'object') calls.push(options);
      };
      helpers.originalScroll(container, button, 'ltr', 'horizontal');
      helpers.nativeScroll(container, button, 'ltr', 'horizontal');
      results.push({ noWindow: owner.defaultView === null, calls });
      container.remove();
    }
    return results;
  });
  expect(observations[0].calls).toEqual([
    { left: 48, top: 0, behavior: 'auto' },
    { left: 48, top: 0, behavior: 'auto' },
  ]);
  expect(observations[1].noWindow).toBe(true);
  expect(observations[1].calls).toHaveLength(2);
  expect(observations[1].calls[1]).toEqual(observations[1].calls[0]);
});
