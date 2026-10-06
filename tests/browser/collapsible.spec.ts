// Direct assertion ports from Base UI 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/collapsible/UPSTREAM_LICENSE. Supplements have zero declaration credit.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`${reference ? '/collapsible-reference' : '/collapsible'}?case=${scenario}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.waitForFunction(() =>
    Boolean((window as Window & { collapsibleFlush?: unknown }).collapsibleFlush),
  );
  return {
    trigger: page.locator('#tested-trigger'),
    panel: page.getByTestId('panel'),
  };
}
async function calls(page: Page) {
  return JSON.parse(await page.getByTestId('calls').innerText()) as {
    open: boolean;
    reason: string;
    type: string;
    before: string;
    canceled: boolean;
  }[];
}
async function flush(page: Page, action = 'click') {
  return page.evaluate((action) => {
    (window as Window & { collapsibleFlush?: (action: string) => void }).collapsibleFlush!(action);
    const panel = document.querySelector('[data-testid="panel"]') as HTMLElement | null;
    return panel
      ? {
          open: panel.hasAttribute('data-open'),
          starting: panel.hasAttribute('data-starting-style'),
          ending: panel.hasAttribute('data-ending-style'),
          height: panel.style.getPropertyValue('--collapsible-panel-height'),
          alignment: panel.style.justifyContent,
          priority: panel.style.getPropertyPriority('justify-content'),
          duration: panel.style.transitionDuration,
        }
      : null;
  }, action);
}
async function frames(page: Page, count = 2) {
  await page.evaluate(async (count) => {
    for (let index = 0; index < count; index++)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }, count);
}
async function animations(page: Page) {
  return page.getByTestId('panel').evaluate((node: HTMLElement) => node.getAnimations().length);
}
async function installRace(page: Page, phase: 'open' | 'close') {
  await page.addInitScript((phase) => {
    const browser = window as Window & {
      race?: Animation;
      raceStarted?: boolean;
    };
    (
      globalThis as typeof globalThis & {
        BASE_UI_ANIMATIONS_DISABLED?: boolean;
      }
    ).BASE_UI_ANIMATIONS_DISABLED = false;
    AbortController.prototype.abort = () => {};
    Element.prototype.getAnimations = function () {
      if (
        this.getAttribute('data-testid') === 'panel' &&
        this.hasAttribute(phase === 'open' ? 'data-open' : 'data-ending-style')
      ) {
        if (!browser.race) {
          browser.race = new Animation(new KeyframeEffect(null, [], 10_000), document.timeline);
          browser.race.play();
        }
        browser.raceStarted = true;
        return [browser.race];
      }
      return [];
    };
  }, phase);
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  test(`R:19 ${framework} sets ARIA attributes`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'ids', reference);
    await expect(trigger).toHaveAttribute('aria-expanded');
    await expect(trigger).toHaveAttribute('aria-controls');
    expect(await trigger.getAttribute('aria-controls')).toBe(await panel.getAttribute('id'));
  });
  test(`R:35 ${framework} references manual panel id`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'manual-id', reference);
    await expect(trigger).toHaveAttribute('aria-controls', 'custom-panel-id');
    await expect(panel).toHaveAttribute('id', 'custom-panel-id');
  });
  test(`R:50 ${framework} unregisters and restores generated panel id`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'ids', reference);
    await page.getByRole('button', { name: 'Toggle panel', exact: true }).click();
    await expect(trigger).not.toHaveAttribute('aria-controls');
    await page.getByRole('button', { name: 'Toggle panel', exact: true }).click();
    await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
  });
  test(`R:74 ${framework} disabled status`, async ({ page }) => {
    const { trigger } = await setup(page, 'disabled', reference);
    await expect(trigger).toHaveAttribute('data-disabled');
  });
  test(`R:87 ${framework} disabled click does not toggle or call onOpenChange`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'disabled', reference);
    await trigger.click({ force: true });
    expect(await calls(page)).toHaveLength(0);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
  });
  test(`R:108 ${framework} calls onOpenChange with eventDetails`, async ({ page }) => {
    const { trigger } = await setup(page, 'uncontrolled', reference);
    await trigger.click();
    const entries = await calls(page);
    expect(entries).toHaveLength(1);
    expect(entries[0].open).toBe(true);
    expect(entries[0]).toBeDefined();
    expect(entries[0].reason).toBe('trigger-press');
    expect((entries[0] as Record<string, unknown>).mouse).toBe(true);
    expect(entries[0].canceled).toBe(false);
    expect((entries[0] as Record<string, unknown>).cancelType).toBe('function');
    expect((entries[0] as Record<string, unknown>).allowType).toBe('function');
  });
  test(`R:132 ${framework} cancellation prevents opening`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'cancel', reference);
    await trigger.click();
    expect(await calls(page)).toHaveLength(1);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
  });
  test(`R:154 ${framework} cancellation prevents closing`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'cancel-close', reference);
    await trigger.click();
    expect(await calls(page)).toHaveLength(1);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toHaveCount(1);
  });
  test(`R:300 ${framework} passes state to class and style callbacks`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'state-callbacks', reference);
    const root = page.getByTestId('root');
    await expect(root).toHaveClass('root-closed');
    await expect(root).toHaveCSS('opacity', '0.5');
    await expect(trigger).toHaveClass('trigger-closed');
    await expect(trigger).toHaveCSS('opacity', '0.5');
    await expect(panel).toHaveClass('panel-closed');
    await expect(panel).toHaveCSS('opacity', '0.5');
    await trigger.click();
    await expect(root).toHaveClass('root-open');
    await expect(root).toHaveCSS('opacity', '1');
    await expect(trigger).toHaveClass('trigger-open');
    await expect(trigger).toHaveCSS('opacity', '1');
    await expect(panel).toHaveClass('panel-open');
    await expect(panel).toHaveCSS('opacity', '1');
  });
  test(`T:9 ${framework} throws outside Root`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(
      `${reference ? '/collapsible-reference' : '/collapsible'}?case=outside-trigger`,
    );
    await expect
      .poll(() => errors.join(' '))
      .toContain(
        'Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.',
      );
  });
  test(`T:32 ${framework} forwards id prop`, async ({ page }) => {
    await setup(page, 'trigger-id', reference);
    await expect(page.getByRole('button', { name: 'Trigger', exact: true })).toHaveAttribute(
      'id',
      'custom-trigger-id',
    );
  });
  test(`P:55 ${framework} warns hiddenUntilFound overrides keepMounted false`, async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') warnings.push(message.text());
    });
    const { panel } = await setup(page, 'hidden-warning', reference);
    await expect
      .poll(() => warnings)
      .toContain(
        'Base UI: The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.',
      );
    await expect(panel).toHaveAttribute('hidden', 'until-found');
  });
  test(`P:77 ${framework} does not unmount panel when keepMounted true`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'controlled-keep', reference);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(1);
    await expect(panel).not.toBeVisible();
    await expect(panel).toHaveAttribute('data-closed');
    await flush(page);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await trigger.getAttribute('aria-controls')).toBe(await panel.getAttribute('id'));
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('data-open');
    await expect(trigger).toHaveAttribute('data-panel-open');
    await flush(page);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(await trigger.getAttribute('aria-controls')).toBe(null);
    await expect(panel).not.toBeVisible();
    await expect(panel).toHaveAttribute('data-closed');
  });
  test(`P:164 ${framework} unmounts panel mounting during ending`, async ({ page }) => {
    const { panel } = await setup(page, 'ending-host', reference);
    await flush(page);
    await frames(page, 1);
    const statuses = reference
      ? await page.evaluate(
          () => (window as Window & { collapsibleStatuses?: string[] }).collapsibleStatuses,
        )
      : (JSON.parse(await page.getByTestId('statuses').innerText()) as string[]);
    expect(statuses).toContain('ending');
    await expect(panel).toHaveCount(0);
  });
  test(`R:178 ${framework} controlled trigger presses request open and close state changes`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'controlled-accept', reference);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toHaveCount(1);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
  });
  test(`R:207 ${framework} does not change controlled open state without an external update`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'controlled', reference);
    await trigger.click();
    expect(await calls(page)).toHaveLength(1);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
  });
  test(`R:226 ${framework} controlled mode`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'controlled', reference);
    await expect(trigger).not.toHaveAttribute('aria-controls');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
    await page.getByRole('button', { name: 'toggle externally' }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls');
    await expect(panel).toHaveCount(1);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('data-open');
    await expect(trigger).toHaveAttribute('data-panel-open');
    await page.getByRole('button', { name: 'toggle externally' }).click();
    await expect(trigger).not.toHaveAttribute('aria-controls');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
  });
  test(`R:267 ${framework} uncontrolled mode`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'uncontrolled', reference);
    await expect(trigger).not.toHaveAttribute('aria-controls');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls');
    await expect(panel).toHaveCount(1);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('data-open');
    await expect(trigger).toHaveAttribute('data-panel-open');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('aria-controls');
    await expect(trigger).not.toHaveAttribute('data-panel-open');
    await expect(panel).toHaveCount(0);
  });
  for (const key of ['Enter', 'Space']) {
    test(`R:348 ${framework} key ${key} does not toggle or call onOpenChange when disabled`, async ({
      page,
    }) => {
      const { trigger, panel } = await setup(page, 'disabled', reference);
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(trigger).toBeFocused();
      await page.keyboard.press(key);
      expect(await calls(page)).toHaveLength(0);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toHaveCount(0);
    });
    test(`R:372 ${framework} key ${key} should toggle the Collapsible`, async ({ page }) => {
      const { trigger, panel } = await setup(page, 'uncontrolled', reference);
      await expect(trigger).not.toHaveAttribute('aria-controls');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toHaveCount(0);
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(trigger).toBeFocused();
      await page.keyboard.press(key);
      await expect(trigger).toHaveAttribute('aria-controls');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(trigger).toHaveAttribute('data-panel-open');
      await expect(panel).toBeVisible();
      await expect(panel).toHaveCount(1);
      await expect(panel).toHaveAttribute('data-open');
      await page.keyboard.press(key);
      await expect(trigger).not.toHaveAttribute('aria-controls');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).not.toHaveAttribute('data-panel-open');
      await expect(panel).toHaveCount(0);
    });
  }
  test(`P:117 ${framework} handles external close with keepMounted without animation`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'controlled-keep', reference);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveAttribute('hidden');
    await expect(panel).toHaveAttribute('data-closed');
    await expect(panel).not.toHaveAttribute('data-ending-style');
    await page.getByRole('button', { name: 'toggle externally' }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).not.toHaveAttribute('hidden');
    await expect(panel).toHaveAttribute('data-open');
    await page.getByRole('button', { name: 'toggle externally' }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveAttribute('hidden');
    await expect(panel).toHaveAttribute('data-closed');
    await expect(panel).not.toHaveAttribute('data-ending-style');
  });
  test(`P:211 ${framework} applies data-starting-style while opening`, async ({ page }) => {
    await setup(page, 'transition', reference);
    const state = await flush(page);
    expect(state?.starting).toBe(true);
    expect(state?.open).toBe(true);
  });
  test(`P:247 ${framework} restores measured height before applying closing transition styles`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'initial-transition', reference);
    await expect
      .poll(() =>
        panel.evaluate((node: HTMLElement) =>
          node.style.getPropertyValue('--collapsible-panel-height'),
        ),
      )
      .toBe('auto');
    await flush(page);
    await expect(panel).toHaveAttribute('data-ending-style');
    expect(
      await panel.evaluate((node: HTMLElement) =>
        node.style.getPropertyValue('--collapsible-panel-height'),
      ),
    ).toMatch(/px$/);
  });
  test(`P:286 ${framework} unmounts zero-size panel without waiting for unrelated transitions`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'zero', reference);
    await expect(panel).toHaveAttribute('data-open');
    // The source queries after act(frame), including its passive-effect flush.
    // The fixture adapters preserve that synchronization without polling/retries.
    const absent = await page.evaluate(() =>
      (
        window as Window & { collapsibleAfterFrame: () => Promise<boolean> }
      ).collapsibleAfterFrame(),
    );
    expect(absent).toBe(true);
  });
  test(`P:322 ${framework} supports removing rendered panel as it closes`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'remove-close', reference);
    await expect(panel).toHaveAttribute('data-open');
    await trigger.click();
    await frames(page, 1);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
    expect((await calls(page)).map((call) => call.open)).toEqual([false]);
  });
  test(`P:422 ${framework} keeps exit transitions working after close interrupted by reopening`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'interrupt', reference);
    await panel.evaluate((node) => {
      (window as Window & { originalPanel?: Element }).originalPanel = node;
    });
    await trigger.click();
    await expect(panel).toHaveAttribute('data-ending-style');
    await trigger.click();
    await expect(panel).toHaveAttribute('data-open');
    await expect(panel).not.toHaveAttribute('data-starting-style');
    await flush(page);
    await expect(panel).toHaveAttribute('data-ending-style');
    expect(
      await panel.evaluate(
        (node) => node === (window as Window & { originalPanel?: Element }).originalPanel,
      ),
    ).toBe(true);
  });
  // The native AbortController stub keeps both frameworks' already-watched
  // finished promises alive across cleanup, so completion sees committed close.
  test(`P:473 ${framework} keeps measured size when open animation finishes during close commit`, async ({
    page,
  }) => {
    await installRace(page, 'open');
    await setup(page, 'race-open', reference);
    await frames(page, 1);
    await page.waitForFunction(() => (window as Window & { raceStarted?: boolean }).raceStarted);
    expect(
      await page.evaluate(() => (window as Window & { raceStarted?: boolean }).raceStarted),
    ).toBe(true);
    const height = await page.evaluate(async () => {
      (window as Window & { collapsibleFlush: (action: string) => void }).collapsibleFlush('click');
      for (let index = 0; index < 3; index++) await Promise.resolve();
      return (
        document.querySelector('[data-testid="panel"]') as HTMLElement
      ).style.getPropertyValue('--collapsible-panel-height');
    });
    expect(height).toMatch(/px$/);
  });
  // The same native abort stub preserves a watched close completion across reopen.
  test(`P:542 ${framework} does not restart entrance when close animation finishes after reopening`, async ({
    page,
  }) => {
    await installRace(page, 'close');
    const { panel } = await setup(page, 'race-close', reference);
    await panel.evaluate((node) => {
      (window as Window & { originalPanel?: Element }).originalPanel = node;
    });
    await flush(page);
    await page.waitForFunction(() => (window as Window & { raceStarted?: boolean }).raceStarted);
    expect(
      await page.evaluate(() => (window as Window & { raceStarted?: boolean }).raceStarted),
    ).toBe(true);
    await flush(page);
    await expect(panel).toHaveAttribute('data-open');
    await expect(panel).not.toHaveAttribute('data-starting-style');
    const afterCompletion = await page.evaluate(async () => {
      (window as Window & { race: Animation }).race.finish();
      // Let the native finished promise, Promise.all and completion continuation
      // settle without a frame that could hide a restarted starting-style phase.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      const node = document.querySelector('[data-testid="panel"]');
      return {
        open: node?.hasAttribute('data-open'),
        starting: node?.hasAttribute('data-starting-style'),
        sameHost: node === (window as Window & { originalPanel?: Element }).originalPanel,
      };
    });
    expect(afterCompletion.open).toBe(true);
    expect(afterCompletion.starting).toBe(false);
    expect(afterCompletion.sameHost).toBe(true);
  });
  test(`P:604 ${framework} does not run mount animation when initially open`, async ({ page }) => {
    const { panel } = await setup(page, 'keys-initial', reference);
    await expect(panel).toHaveAttribute('data-open');
    expect(await animations(page)).toBe(0);
    await expect(panel).toHaveCSS('animation-name', 'none');
  });
  test(`P:640 ${framework} still animates on close and reopen after initially open`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'keys-both', reference);
    expect(await animations(page)).toBe(0);
    await flush(page);
    await expect(panel).toHaveAttribute('data-closed');
    expect(await animations(page)).toBe(1);
    await flush(page);
    await expect(panel).toHaveAttribute('data-open');
    expect(await animations(page)).toBe(1);
  });
  test(`P:704 ${framework} restores measured dimensions before closing keyframes`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'keys-close', reference);
    await expect
      .poll(() =>
        panel.evaluate((node: HTMLElement) =>
          node.style.getPropertyValue('--collapsible-panel-height'),
        ),
      )
      .toBe('auto');
    await flush(page);
    await expect(panel).toHaveAttribute('data-ending-style');
    expect(
      await panel.evaluate((node: HTMLElement) =>
        node.style.getPropertyValue('--collapsible-panel-height'),
      ),
    ).toMatch(/px$/);
    expect(await animations(page)).toBe(1);
  });
  test(`P:749 ${framework} animates reopen when only open keyframes defined`, async ({ page }) => {
    const { panel } = await setup(page, 'keys-open', reference);
    expect(await animations(page)).toBe(0);
    await flush(page);
    await expect(panel).toHaveAttribute('data-closed');
    await flush(page);
    await expect(panel).toHaveAttribute('data-open');
    expect(await animations(page)).toBe(1);
  });
  test(`P:799 ${framework} SSR suppresses initially open keyframes`, async ({ page }) => {
    const response = await page.goto(
      `/collapsible-ssr?case=keys-initial${reference ? '&reference' : ''}`,
    );
    const style = await page.evaluate(
      (markup) => {
        const panel = new DOMParser()
          .parseFromString(markup, 'text/html')
          .querySelector('[data-testid="panel"]') as HTMLElement | null;
        return panel?.style.animationName;
      },
      await response!.text(),
    );
    expect(style).toBe('none');
  });
  test(`P:830 ${framework} SSR suppresses inline initially open keyframes`, async ({ page }) => {
    const response = await page.goto(
      `/collapsible-ssr?case=keys-inline${reference ? '&reference' : ''}`,
    );
    const style = await page.evaluate(
      (markup) => {
        const panel = new DOMParser()
          .parseFromString(markup, 'text/html')
          .querySelector('[data-testid="panel"]') as HTMLElement | null;
        return {
          name: panel?.style.animationName,
          duration: panel?.style.animationDuration,
        };
      },
      await response!.text(),
    );
    expect(style.name).toBe('none');
    expect(style.duration).toBe('100ms');
  });
  test(`P:1205 ${framework} keeps temporary zero animation duration until closes`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'beforematch-keys', reference);
    await flush(page, 'beforematch');
    await expect(panel).toHaveAttribute('data-open');
    await frames(page);
    await expect(panel).toHaveCSS('animation-duration', '0s');
    await trigger.click();
    await expect(panel).toHaveAttribute('data-closed');
    expect(await animations(page)).toBe(1);
    await expect(panel).toHaveCSS('animation-duration', '0.123s');
  });
  test(`P:1287 ${framework} restores transition duration before first beforematch close`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'beforematch-transition', reference);
    await flush(page, 'beforematch');
    await expect(panel).toHaveAttribute('data-open');
    await frames(page);
    await expect(panel).toHaveCSS('transition-duration', '0s');
    await flush(page);
    await expect(panel).toHaveAttribute('data-ending-style');
    expect(await panel.evaluate((node: HTMLElement) => node.style.transitionDuration)).toBe(
      '123ms',
    );
    expect(await animations(page)).toBe(1);
  });
  test(`P:1349 ${framework} does not suppress animated open after no-motion beforematch`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'beforematch-no-motion', reference);
    await flush(page, 'beforematch');
    await expect(panel).toHaveAttribute('data-open');
    await trigger.click();
    await expect(panel).toHaveAttribute('data-closed');
    await page.getByRole('button', { name: 'enable motion' }).click();
    const state = await flush(page);
    expect(state?.open).toBe(true);
    expect(state?.duration).toBe('123ms');
  });
  test(`P:1474 ${framework} does not keep hidden transition running after closes`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'hidden-motion', reference);
    await trigger.click();
    await expect(panel).toHaveAttribute('data-open');
    await trigger.click();
    await expect(panel).toHaveAttribute('hidden', 'until-found');
    await frames(page);
    expect(
      await panel.evaluate(
        (node: HTMLElement) =>
          node.getAnimations().filter((animation) => animation.playState !== 'finished').length,
      ),
    ).toBe(0);
    await expect(panel).toHaveCSS('opacity', '0');
  });
  test(`P:1541 ${framework} canceled beforematch does not suppress next trigger open`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'beforematch-cancel', reference);
    await flush(page, 'beforematch');
    expect(await calls(page)).toHaveLength(1);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveAttribute('data-closed');
    const state = await flush(page);
    expect(await calls(page)).toHaveLength(2);
    expect(state?.open).toBe(true);
    expect(state?.duration).toBe('123ms');
  });
  test(`P:1599 ${framework} uses hidden until-found and responds to beforematch`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'hidden', reference);
    await expect(panel).toHaveAttribute('hidden', 'until-found');
    await flush(page, 'beforematch');
    expect(await calls(page)).toHaveLength(1);
    await expect(panel).toHaveAttribute('data-open');
  });
  for (const scenario of ['custom', 'link'])
    test(`supplement: ${framework} ${scenario} trusted keyboard/default activation`, async ({
      page,
    }) => {
      const { trigger } = await setup(page, scenario, reference);
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      if (scenario === 'link') expect(new URL(page.url()).hash).toBe('#target');
      await trigger.focus();
      await page.keyboard.press('Space');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect((await calls(page)).map((call) => call.open)).toEqual([true, false]);
    });
  for (const scenario of ['submit', 'reset', 'external-form'])
    test(`supplement: ${framework} ${scenario} retains native form behavior`, async ({ page }) => {
      const { trigger } = await setup(page, scenario, reference);
      await expect(trigger).toHaveAttribute('type', scenario === 'reset' ? 'reset' : 'submit');
      await page.getByRole('textbox', { name: 'Reset field' }).fill('changed');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const counts = {
        submitted: scenario === 'submit' ? 1 : 0,
        reset: scenario === 'reset' ? 1 : 0,
        externalSubmitted: scenario === 'external-form' ? 1 : 0,
      };
      await expect(page.getByTestId('forms')).toHaveText(JSON.stringify(counts));
      await expect(page.getByRole('textbox', { name: 'Reset field' })).toHaveValue(
        scenario === 'reset' ? 'initial' : 'changed',
      );
      if (scenario !== 'reset') {
        await expect(trigger).toHaveAttribute('value', 'sent');
        expect(
          await page
            .locator(scenario === 'external-form' ? '#external-form' : '#collapsible-form')
            .evaluate((node: HTMLFormElement) =>
              new FormData(
                node,
                document.getElementById('tested-trigger') as HTMLButtonElement,
              ).get('collapsible'),
            ),
        ).toBe('sent');
      }
    });
  // Native live state/callback timing earns zero divergent unchanged Original credit.
  for (const scenario of [
    'controlled-consumer',
    'controlled-render',
    'callback-consumer',
    'callback-render',
  ])
    test(`supplement: ${framework} ${scenario} ${reference ? 'rendered callback snapshot' : 'live state and callbacks'}`, async ({
      page,
    }) => {
      const { trigger } = await setup(page, scenario, reference);
      const liveControlled = !reference && scenario.startsWith('controlled');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', liveControlled ? 'false' : 'true');
      expect((await calls(page))[0].before).toBe('false');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect((await calls(page)).map((call) => call.open)).toEqual(
        liveControlled ? [false, false] : [true, false],
      );
      if (scenario.startsWith('callback'))
        await expect(page.getByTestId('callback-owners')).toHaveText(
          reference ? '["old","new"]' : '["new","new"]',
        );
    });
  test(`supplement: ${framework} IDs follow removal remount and explicit changes`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'ids', reference);
    await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
    await page.getByRole('button', { name: 'Toggle panel', exact: true }).click();
    await expect(trigger).not.toHaveAttribute('aria-controls');
    await page.getByRole('button', { name: 'Toggle panel', exact: true }).click();
    await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
    await page.getByRole('button', { name: 'Change ID' }).click();
    await expect(panel).toHaveAttribute('id', 'manual-panel');
    await expect(trigger).toHaveAttribute('aria-controls', 'manual-panel');
    await page.getByRole('button', { name: 'Change ID' }).click();
    await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
  });
  test(`supplement: ${framework} no animation API and teardown cancel pending lifecycle`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Element.prototype, 'getAnimations', {
        configurable: true,
        value: undefined,
      });
    });
    const { trigger, panel } = await setup(page, 'interrupt', reference);
    await trigger.click();
    await expect(panel).toHaveCount(0);
    await trigger.click();
    await expect(panel).toHaveAttribute('data-open');
    await trigger.click();
    await page.getByRole('button', { name: 'Toggle mounting', exact: true }).click();
    await frames(page, 4);
    await expect(trigger).toHaveCount(0);
  });
  test(`supplement: ${framework} removed panel host retains pinned ending callbacks`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'remove-close', reference);
    await expect(panel).toHaveAttribute('data-open');
    await expect(panel).toHaveCSS('transition-duration', '0.1s');
    // Actual pin witnesses confirm both null-host effect paths skip completion,
    // leaving Root and Trigger in ending after the deferred frame commits.
    const snapshot = await page.evaluate(async () => {
      const absent = await (
        window as Window & { collapsibleAfterFrame: () => Promise<boolean> }
      ).collapsibleAfterFrame();
      const root = document.querySelector('[data-testid="root"]');
      const trigger = document.getElementById('tested-trigger');
      const calls = JSON.parse(document.querySelector('[data-testid="calls"]')!.textContent!) as {
        open: boolean;
      }[];
      return {
        root: root?.className,
        trigger: trigger?.className,
        absent,
        ending: [root, trigger].map((node) => node?.hasAttribute('data-ending-style')),
        expanded: trigger?.getAttribute('aria-expanded'),
        controls: trigger?.getAttribute('aria-controls'),
        calls: calls.map((call) => call.open),
      };
    });
    expect(snapshot).toEqual({
      root: 'root-closed-enabled-ending',
      trigger: 'trigger-closed-enabled-ending',
      absent: true,
      ending: [true, true],
      expanded: 'false',
      controls: null,
      calls: [false],
    });
  });
  test(`supplement: ${framework} no-motion close retains pinned idle callbacks`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'no-motion-status', reference);
    await expect(panel).toHaveAttribute('data-open');
    // Independent React 1.8.0/Svelte witnesses confirm the pin only clears an
    // ending phase. No-motion unmount bookkeeping cancels that deferred phase,
    // retaining idle on Root, Trigger and the keepMounted Panel callbacks.
    const snapshot = await page.evaluate(async () => {
      await (
        window as Window & { collapsibleAfterFrame: () => Promise<boolean> }
      ).collapsibleAfterFrame();
      const root = document.querySelector('[data-testid="root"]');
      const trigger = document.getElementById('tested-trigger');
      const panel = document.querySelector('[data-testid="panel"]');
      return {
        root: root?.className,
        trigger: trigger?.className,
        panel: panel?.className,
        panelStatus: panel?.getAttribute('data-status'),
        hidden: panel?.hasAttribute('hidden'),
        expanded: trigger?.getAttribute('aria-expanded'),
        controls: trigger?.getAttribute('aria-controls'),
        ending: [root, trigger, panel].map((node) => node?.hasAttribute('data-ending-style')),
      };
    });
    expect(snapshot).toEqual({
      root: 'root-closed-enabled-idle',
      trigger: 'trigger-closed-enabled-idle',
      panel: 'panel-closed-enabled-idle',
      panelStatus: 'idle',
      hidden: true,
      expanded: 'false',
      controls: null,
      ending: [false, false, false],
    });
  });
  test(`supplement: ${framework} explicit disabled false overrides Root`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'disabled-override', reference);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    expect(await calls(page)).toHaveLength(1);
  });
  test(`supplement: ${framework} disabled custom activation remains focusable`, async ({
    page,
  }) => {
    const { trigger } = await setup(page, 'custom-disabled', reference);
    await trigger.focus();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await trigger.click({ force: true });
    expect(await calls(page)).toHaveLength(0);
  });
  test(`supplement: ${framework} BASE_UI_ANIMATIONS_DISABLED completes bounded motion`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (
        globalThis as typeof globalThis & {
          BASE_UI_ANIMATIONS_DISABLED?: boolean;
        }
      ).BASE_UI_ANIMATIONS_DISABLED = true;
    });
    const { panel } = await setup(page, 'initial-transition', reference);
    await flush(page);
    await frames(page, 3);
    await expect(panel).toHaveCount(0);
  });
  test(`supplement: ${framework} authored important layout restoration characterization`, async ({
    page,
  }) => {
    const { panel } = await setup(page, 'important', reference);
    expect(
      await panel.evaluate((node: HTMLElement) =>
        node.style.getPropertyPriority('justify-content'),
      ),
    ).toBe('important');
    await flush(page);
    await frames(page);
    expect(
      await panel.evaluate((node: HTMLElement) => ({
        value: node.style.justifyContent,
        priority: node.style.getPropertyPriority('justify-content'),
      })),
    ).toEqual({ value: 'center', priority: '' });
  });
  test(`native supplement: ${framework} beforematch observes framework host replacement semantics`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, 'replaced-host', reference);
    await panel.evaluate((node) => {
      (window as Window & { originalPanel?: Element }).originalPanel = node;
    });
    await page.getByRole('button', { name: 'Replace host' }).click();
    expect(
      await panel.evaluate(
        (node) => node === (window as Window & { originalPanel?: Element }).originalPanel,
      ),
    ).toBe(false);
    await flush(page, 'beforematch');
    await expect(trigger).toHaveAttribute('aria-expanded', reference ? 'false' : 'true');
    expect(await calls(page)).toHaveLength(reference ? 0 : 1);
  });
}

for (const reference of [true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  test(`P:358 ${framework} preserves inline alignment styles while measuring an opening panel`, async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') warnings.push(message.text());
    });
    const { panel } = await setup(page, 'mixed', reference);
    const state = await flush(page);
    expect(state?.starting).toBe(true);
    expect(state?.alignment).toBe('initial');
    expect(state?.priority).toBe('important');
    expect(warnings).toContain(
      'Base UI: CSS transitions and CSS animations both detected on Collapsible or Accordion panel. Only one of either animation type should be used.',
    );
    await frames(page, 1);
    expect(await panel.evaluate((node: HTMLElement) => node.style.justifyContent)).toBe('center');
  });
}

// Native renderer counterpart of P358; divergent expectations earn zero Original credit.
test('native counterpart: Svelte opening measurements preserve authored alignment through native style commits', async ({
  page,
}) => {
  await page.goto('/native-snippets');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const baseline = await page.getByTestId('literal-native-style').evaluate((node) =>
    (
      node as HTMLDivElement & {
        nativeStyle: {
          write(property: string): {
            beforeStateWrite: { properties: Record<string, { value: string; priority: string }> };
            afterFlush: {
              connected: boolean;
              properties: Record<string, { value: string; priority: string }>;
            };
            sameHost: boolean;
          };
        };
      }
    ).nativeStyle.write('justify-content'),
  );
  expect(baseline.beforeStateWrite.properties['justify-content']).toEqual({
    value: 'initial',
    priority: 'important',
  });
  expect(baseline.sameHost).toBe(true);
  expect(baseline.afterFlush.connected).toBe(true);
  expect(baseline.afterFlush.properties['justify-content']).toEqual({
    value: 'center',
    priority: '',
  });

  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  const { panel } = await setup(page, 'mixed', false);
  const opening = await panel.evaluate((original: HTMLElement) => {
    (window as Window & { collapsibleFlush(action: string): void }).collapsibleFlush('click');
    const node = document.querySelector('[data-testid="panel"]') as HTMLElement;
    const trigger = document.getElementById('tested-trigger')!;
    return {
      sameHost: node === original,
      connected: node.isConnected,
      open: node.hasAttribute('data-open'),
      starting: node.hasAttribute('data-starting-style'),
      hidden: node.hasAttribute('hidden'),
      alignment: node.style.justifyContent,
      priority: node.style.getPropertyPriority('justify-content'),
      dimensions: [
        node.style.getPropertyValue('--collapsible-panel-height'),
        node.style.getPropertyValue('--collapsible-panel-width'),
      ],
      scrollDimensions: [node.scrollHeight, node.scrollWidth],
      expanded: trigger.getAttribute('aria-expanded'),
      controls: trigger.getAttribute('aria-controls'),
      id: node.id,
      calls: JSON.parse(document.querySelector('[data-testid="calls"]')!.textContent!),
      order: JSON.parse(document.querySelector('[data-testid="order"]')!.textContent!),
    };
  });
  expect(opening).toMatchObject({
    sameHost: true,
    connected: true,
    open: true,
    starting: true,
    hidden: false,
    alignment: 'center',
    priority: '',
    expanded: 'true',
    controls: opening.id,
  });
  expect(opening.dimensions).toEqual(opening.scrollDimensions.map((dimension) => `${dimension}px`));
  expect(opening.scrollDimensions.every((dimension) => dimension > 0)).toBe(true);
  expect(opening.calls).toHaveLength(1);
  expect(opening.calls[0]).toMatchObject({
    open: true,
    reason: 'trigger-press',
    type: 'click',
    before: 'false',
    canceled: false,
  });
  expect(opening.order).toEqual(['consumer', 'change']);
  expect(warnings).toEqual([
    'Base UI: CSS transitions and CSS animations both detected on Collapsible or Accordion panel. Only one of either animation type should be used.',
  ]);
  await frames(page, 1);
  expect(
    await panel.evaluate((node: HTMLElement) => ({
      alignment: node.style.justifyContent,
      priority: node.style.getPropertyPriority('justify-content'),
    })),
  ).toEqual({ alignment: 'center', priority: '' });
});

for (const reference of [true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  for (const scenario of ['beforematch-transition', 'beforematch-keys'])
    test(`supplement: ${framework} ${scenario} teardown restores authored duration`, async ({
      page,
    }) => {
      const { panel } = await setup(page, scenario, reference);
      await flush(page, 'beforematch');
      await panel.evaluate((node) => {
        (window as Window & { removedPanel?: HTMLElement }).removedPanel = node as HTMLElement;
      });
      await page.getByRole('button', { name: 'Toggle mounting', exact: true }).click();
      await frames(page, 3);
      await expect(panel).toHaveCount(0);
      expect(
        await page.evaluate((scenario) => {
          const node = (window as Window & { removedPanel?: HTMLElement }).removedPanel!;
          return {
            connected: node.isConnected,
            duration:
              scenario === 'beforematch-keys'
                ? node.style.animationDuration
                : node.style.transitionDuration,
          };
        }, scenario),
      ).toEqual({ connected: false, duration: '123ms' });
    });
}

for (const scenario of ['beforematch-transition', 'beforematch-keys'])
  test(`native supplement: Svelte ${scenario} teardown retains last native duration`, async ({
    page,
  }) => {
    const { trigger, panel } = await setup(page, scenario, false);
    await flush(page, 'beforematch');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toHaveAttribute('data-open');
    const beforeRemoval = await panel.evaluate((node: HTMLElement, scenario) => {
      (window as Window & { removedPanel?: HTMLElement }).removedPanel = node;
      return {
        connected: node.isConnected,
        duration:
          scenario === 'beforematch-keys'
            ? node.style.animationDuration
            : node.style.transitionDuration,
      };
    }, scenario);
    expect(beforeRemoval).toEqual({ connected: true, duration: '0s' });
    const requests = await calls(page);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      open: true,
      reason: 'none',
      type: 'beforematch',
      before: 'false',
      canceled: false,
    });
    const orderBeforeRemoval = await page.getByTestId('order').innerText();
    await page.getByRole('button', { name: 'Toggle mounting', exact: true }).click();
    await frames(page, 3);
    await expect(panel).toHaveCount(0);
    await expect(trigger).toHaveCount(0);
    expect(
      await page.evaluate((scenario) => {
        const node = (window as Window & { removedPanel?: HTMLElement }).removedPanel!;
        return {
          connected: node.isConnected,
          duration:
            scenario === 'beforematch-keys'
              ? node.style.animationDuration
              : node.style.transitionDuration,
        };
      }, scenario),
    ).toEqual({ connected: false, duration: beforeRemoval.duration });
    await page.evaluate(() => {
      const node = (window as Window & { removedPanel?: HTMLElement }).removedPanel!;
      node.dispatchEvent(new Event('beforematch', { bubbles: true }));
    });
    await frames(page);
    expect(await calls(page)).toEqual(requests);
    expect(await page.getByTestId('order').innerText()).toBe(orderBeforeRemoval);
    await expect(panel).toHaveCount(0);
    await expect(trigger).toHaveCount(0);
  });

for (const reference of [true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  test(`supplement: ${framework} initially controlled undefined uses the initial default and preserves its warning`, async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') warnings.push(message.text());
    });
    const { trigger, panel } = await setup(page, 'controlled-default', reference);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);
    await page.getByRole('button', { name: 'Release controlled value' }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toHaveAttribute('data-open');
    await expect
      .poll(() => warnings.join(' '))
      .toContain(
        'A component is changing the controlled open state of Collapsible to be uncontrolled.',
      );
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      (await calls(page)).map((call) => ({
        open: call.open,
        before: call.before,
      })),
    ).toEqual([{ open: false, before: 'true' }]);
  });
}

test('native supplement: Svelte controlled undefined retains initial-default fallback and request-only controlled writes', async ({
  page,
}) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.type() === 'warning') warnings.push(message.text());
  });
  const { trigger, panel } = await setup(page, 'controlled-default', false);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveCount(0);
  expect(await calls(page)).toEqual([]);
  await page.getByRole('button', { name: 'Release controlled value' }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveAttribute('data-open');
  expect(await calls(page)).toEqual([]);
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveAttribute('data-open');
  const requests = await calls(page);
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    open: false,
    before: 'true',
    reason: 'trigger-press',
    type: 'click',
    canceled: false,
    defaultPrevented: false,
    mouse: true,
    cancelType: 'function',
    allowType: 'function',
  });
  await expect(page.getByTestId('order')).toHaveText('["consumer","change"]');
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});

for (const reference of [false, true])
  test(`supplement: ${reference ? 'React reference' : 'Svelte'} SSR hydration retains generated IDs and authored motion suppression`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text());
    });
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const node = document.querySelector('[data-testid="panel"]');
        if (node) {
          (
            window as Window & {
              serverPanel?: Element;
              serverPanelId?: string | null;
            }
          ).serverPanel = node;
          (window as Window & { serverPanelId?: string | null }).serverPanelId =
            node.getAttribute('id');
          (window as Window & { serverPanelBeforeHydration?: boolean }).serverPanelBeforeHydration =
            document.querySelector('main')?.getAttribute('data-hydrated') === 'false';
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });
    const response = await page.goto(
      reference ? '/collapsible-ssr?case=keys-initial&reference' : '/collapsible?case=keys-initial',
    );
    expect(response?.status()).toBe(200);
    const serverMarkup = await response!.text();
    const server = await page.evaluate((markup) => {
      const document = new DOMParser().parseFromString(markup, 'text/html');
      const panel = document.querySelector('[data-testid="panel"]') as HTMLElement | null;
      const trigger = document.getElementById('tested-trigger');
      return {
        panelExists: panel !== null,
        panelId: panel?.id,
        controlledId: trigger?.getAttribute('aria-controls'),
        open: panel?.hasAttribute('data-open'),
        animationName: panel?.style.animationName,
      };
    }, serverMarkup);
    expect(server.panelExists).toBe(true);
    expect(server.panelId).toBeTruthy();
    expect(server.controlledId).toBe(server.panelId);
    expect(server.open).toBe(true);
    expect(server.animationName).toBe('none');
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const panel = page.getByTestId('panel'),
      trigger = page.locator('#tested-trigger');
    expect(
      await page.evaluate(
        () =>
          (window as Window & { serverPanelBeforeHydration?: boolean }).serverPanelBeforeHydration,
      ),
    ).toBe(true);
    expect(
      await panel.evaluate(
        (node) => node === (window as Window & { serverPanel?: Element }).serverPanel,
      ),
    ).toBe(true);
    expect(await panel.getAttribute('id')).toBe(server.panelId);
    expect(await panel.getAttribute('id')).toBe(
      await page.evaluate(
        () => (window as Window & { serverPanelId?: string | null }).serverPanelId,
      ),
    );
    await expect(trigger).toHaveAttribute('aria-controls', server.panelId!);
    await expect(panel).toHaveCSS('animation-name', 'none');
    expect(errors).toEqual([]);
  });

// Append after the existing Collapsible cases and helpers; leave every existing body unchanged.
// Unexecuted source draft. Diagnostic only; zero Original/canonical credit.
test('diagnostic: native style-string commits preserve panel reveal and first-close business', async ({
  page,
}, testInfo) => {
  const consoleEvents: { route: string; type: string; text: string }[] = [];
  const observations: unknown[] = [];
  const errors: string[] = [];
  const routeFailures: { route: string; error: string }[] = [];
  const prefix = 'native-collapsible-css:';
  let route = 'literal';
  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    if (type === 'warning' || type === 'error') {
      const event = { route, type, text };
      consoleEvents.push(event);
      console.log(JSON.stringify({ console: event }));
      if (type === 'error') errors.push(`${route}: ${text}`);
    } else if (text.startsWith(prefix)) {
      observations.push(JSON.parse(text.slice(prefix.length)));
      console.log(text);
    }
  });
  page.on('pageerror', (error) => {
    errors.push(`${route}: ${error.message}`);
    console.log(JSON.stringify({ pageError: { route, message: error.message } }));
  });
  function record(label: string, value: unknown) {
    const observation = { route, label, value };
    observations.push(observation);
    console.log(JSON.stringify(observation));
  }
  try {
    await page.goto('/native-snippets');
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const literal = page.getByTestId('literal-native-style');
    for (const property of [
      'justify-content',
      'animation-duration',
      'transition-duration',
    ] as const) {
      const phases = await literal.evaluate(async (node, property) => {
        const api = (
          node as HTMLDivElement & {
            nativeStyle: { write(property: string): unknown; sample(): unknown };
          }
        ).nativeStyle;
        console.info(
          `native-collapsible-css:${JSON.stringify({ route: 'literal', label: `before:${property}`, value: api.sample() })}`,
        );
        const committed = api.write(property);
        console.info(
          `native-collapsible-css:${JSON.stringify({ route: 'literal', label: `commit:${property}`, value: committed })}`,
        );
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const frame1 = api.sample();
        console.info(
          `native-collapsible-css:${JSON.stringify({ route: 'literal', label: `frame1:${property}`, value: frame1 })}`,
        );
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const frame2 = api.sample();
        console.info(
          `native-collapsible-css:${JSON.stringify({ route: 'literal', label: `frame2:${property}`, value: frame2 })}`,
        );
        return { committed, frame1, frame2 };
      }, property);
      record(`literal:${property}`, phases);
    }
    expect
      .soft(consoleEvents.filter((event) => event.route === 'literal' && event.type === 'warning'))
      .toEqual([]);
    for (const { scenario, reference } of [
      { scenario: 'mixed', reference: false },
      { scenario: 'beforematch-keys', reference: false },
      { scenario: 'beforematch-transition', reference: false },
      { scenario: 'beforematch-keys-class', reference: false },
      { scenario: 'beforematch-keys-class', reference: true },
      { scenario: 'beforematch-cancel', reference: false },
    ]) {
      route = `${reference ? 'React reference' : 'Svelte'}:${scenario}`;
      try {
        await setup(page, scenario, reference);
        const phases = await page.evaluate(
          async ({ scenario, route }) => {
            const original = document.querySelector('[data-testid="panel"]');
            const browser = window as Window & { collapsibleFlush(action: string): void };
            function sample() {
              const panel = document.querySelector('[data-testid="panel"]') as HTMLElement | null;
              if (!panel)
                throw new Error('Retained public panel disappeared during CSS diagnostic.');
              const rect = panel.getBoundingClientRect();
              const computed = getComputedStyle(panel);
              return {
                sameHost: panel === original,
                connected: panel.isConnected,
                expanded: document.getElementById('tested-trigger')?.getAttribute('aria-expanded'),
                hidden: panel.getAttribute('hidden'),
                open: panel.hasAttribute('data-open'),
                closed: panel.hasAttribute('data-closed'),
                starting: panel.hasAttribute('data-starting-style'),
                ending: panel.hasAttribute('data-ending-style'),
                status: panel.getAttribute('data-status'),
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                height: rect.height,
                width: rect.width,
                scrollHeight: panel.scrollHeight,
                scrollWidth: panel.scrollWidth,
                measuredHeight: panel.style.getPropertyValue('--collapsible-panel-height'),
                measuredWidth: panel.style.getPropertyValue('--collapsible-panel-width'),
                cssText: panel.style.cssText,
                className: panel.className,
                alignment: panel.style.justifyContent,
                alignmentPriority: panel.style.getPropertyPriority('justify-content'),
                animationDuration: panel.style.animationDuration,
                transitionDuration: panel.style.transitionDuration,
                animationPriority: panel.style.getPropertyPriority('animation-duration'),
                transitionPriority: panel.style.getPropertyPriority('transition-duration'),
                computedAnimationDuration: computed.animationDuration,
                computedTransitionDuration: computed.transitionDuration,
                animations: panel.getAnimations().map((animation) => ({
                  kind: animation.constructor.name,
                  name:
                    animation instanceof CSSAnimation
                      ? animation.animationName
                      : animation instanceof CSSTransition
                        ? animation.transitionProperty
                        : animation.id,
                  startTime: animation.startTime === null ? null : String(animation.startTime),
                  playbackRate: animation.playbackRate,
                  pending: animation.pending,
                  playState: animation.playState,
                  currentTime:
                    animation.currentTime === null ? null : String(animation.currentTime),
                  duration: String(animation.effect?.getComputedTiming().duration),
                })),
                calls: JSON.parse(document.querySelector('[data-testid="calls"]')!.textContent!),
                order: JSON.parse(document.querySelector('[data-testid="order"]')!.textContent!),
              };
            }
            function observe(label: string) {
              const value = sample();
              console.info(`native-collapsible-css:${JSON.stringify({ route, label, value })}`);
              return value;
            }
            async function frame(label: string) {
              await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
              return observe(label);
            }
            const before = observe('before-action');
            browser.collapsibleFlush(scenario === 'mixed' ? 'click' : 'beforematch');
            const immediate = observe('after-flush');
            const frame1 = await frame('frame1');
            const frame2 = await frame('frame2');
            if (scenario === 'mixed')
              return { before, immediate, frame1, frame2, close: null, next: null };
            if (scenario === 'beforematch-cancel') {
              browser.collapsibleFlush('click');
              const next = {
                immediate: observe('uncanceled-trigger-flush'),
                frame1: await frame('uncanceled-trigger-frame1'),
                frame2: await frame('uncanceled-trigger-frame2'),
              };
              return { before, immediate, frame1, frame2, close: null, next };
            }
            browser.collapsibleFlush('click');
            const closeImmediate = observe('close-immediate');
            const closeFrame1 = await frame('close-frame1');
            const closeFrame2 = await frame('close-frame2');
            const panel = document.querySelector('[data-testid="panel"]')!;
            const finished = await Promise.allSettled(
              panel.getAnimations().map((animation) => animation.finished),
            );
            const completion = finished.map((result) =>
              result.status === 'fulfilled'
                ? { status: 'fulfilled' }
                : { status: 'rejected', reason: String(result.reason) },
            );
            console.info(
              `native-collapsible-css:${JSON.stringify({ route, label: 'close-completion', value: completion })}`,
            );
            const completed = await frame('close-completed');
            return {
              before,
              immediate,
              frame1,
              frame2,
              next: null,
              close: {
                immediate: closeImmediate,
                frame1: closeFrame1,
                frame2: closeFrame2,
                completion,
                completed,
              },
            };
          },
          { scenario, route },
        );
        const warnings = consoleEvents
          .filter((event) => event.route === route && event.type === 'warning')
          .map((event) => event.text);
        record(`panel:${scenario}:console`, { warnings, errors: [...errors] });
        expect
          .soft(warnings)
          .toEqual(
            scenario === 'mixed'
              ? [
                  'Base UI: CSS transitions and CSS animations both detected on Collapsible or Accordion panel. Only one of either animation type should be used.',
                ]
              : [],
          );
        for (const phase of [phases.before, phases.immediate, phases.frame1, phases.frame2]) {
          expect.soft(phase.sameHost).toBe(true);
          expect.soft(phase.connected).toBe(true);
        }
        if (scenario !== 'mixed') {
          expect.soft(phases.before.expanded).toBe('false');
          expect.soft(phases.before.closed).toBe(true);
          expect.soft(phases.before.open).toBe(false);
          expect.soft(phases.before.hidden).toBe('until-found');
          expect.soft(phases.before.calls).toEqual([]);
          expect.soft(phases.before.order).toEqual([]);
        }
        if (scenario === 'beforematch-cancel') {
          for (const canceled of [phases.immediate, phases.frame1, phases.frame2]) {
            expect.soft(canceled.expanded).toBe('false');
            expect.soft(canceled.hidden).toBe('until-found');
            expect.soft(canceled.closed).toBe(true);
            expect.soft(canceled.open).toBe(false);
            expect.soft(canceled.calls).toHaveLength(1);
            expect.soft(canceled.calls[0]).toMatchObject({
              open: true,
              reason: 'none',
              type: 'beforematch',
              before: 'false',
              canceled: true,
            });
            expect.soft(canceled.order).toEqual(['change']);
            expect.soft(canceled.animations).toHaveLength(0);
          }
          const next = phases.next!;
          expect.soft(next.immediate.open).toBe(true);
          expect.soft(next.immediate.starting).toBe(true);
          expect.soft(next.immediate.transitionDuration).toBe('123ms');
          expect.soft(next.frame2.animations).toHaveLength(1);
          expect.soft(next.frame2.calls).toHaveLength(2);
          expect.soft(next.frame2.calls[1]).toMatchObject({
            open: true,
            reason: 'trigger-press',
            type: 'click',
            before: 'false',
            canceled: false,
          });
          expect.soft(next.frame2.order).toEqual(['change', 'consumer', 'change']);
          continue;
        }
        expect.soft(phases.immediate.expanded).toBe('true');
        expect.soft(phases.immediate.open).toBe(true);
        expect.soft(phases.immediate.scrollHeight).toBeGreaterThan(0);
        expect.soft(phases.immediate.measuredHeight).toMatch(/^\d+(?:\.\d+)?px$/);
        expect.soft(phases.immediate.measuredWidth).toMatch(/^\d+(?:\.\d+)?px$/);
        expect
          .soft(Number.parseFloat(phases.immediate.measuredHeight))
          .toBe(phases.immediate.scrollHeight);
        expect
          .soft(Number.parseFloat(phases.immediate.measuredWidth))
          .toBe(phases.immediate.scrollWidth);
        expect.soft(phases.immediate.calls).toHaveLength(1);
        expect.soft(phases.immediate.calls[0]).toMatchObject({
          open: true,
          reason: scenario === 'mixed' ? 'trigger-press' : 'none',
          type: scenario === 'mixed' ? 'click' : 'beforematch',
          before: 'false',
          canceled: false,
        });
        expect
          .soft(phases.immediate.order)
          .toEqual(scenario === 'mixed' ? ['consumer', 'change'] : ['change']);
        if (scenario === 'mixed') {
          expect.soft(phases.immediate.starting).toBe(true);
          expect.soft(phases.frame1.alignment).toBe('center');
        } else {
          for (const revealed of [phases.immediate, phases.frame1, phases.frame2]) {
            expect.soft(revealed.hidden).toBeNull();
            expect.soft(revealed.expanded).toBe('true');
            expect.soft(revealed.open).toBe(true);
            expect.soft(revealed.closed).toBe(false);
            expect.soft(revealed.scrollHeight).toBeGreaterThan(0);
            expect.soft(revealed.height).toBeGreaterThanOrEqual(revealed.scrollHeight - 1);
            expect.soft(revealed.width).toBeGreaterThanOrEqual(revealed.scrollWidth - 1);
            expect.soft(revealed.calls).toHaveLength(1);
            expect.soft(revealed.calls[0].canceled).toBe(false);
            expect.soft(revealed.starting).toBe(false);
            expect.soft(revealed.ending).toBe(false);
            expect
              .soft(
                revealed.animations.some(
                  (animation) => animation.pending || animation.playState === 'running',
                ),
              )
              .toBe(false);
          }
          const close = phases.close!;
          for (const closing of [close.immediate, close.frame1, close.frame2, close.completed]) {
            expect.soft(closing.sameHost).toBe(true);
            expect.soft(closing.connected).toBe(true);
            expect.soft(closing.expanded).toBe('false');
            expect.soft(closing.closed).toBe(true);
            expect.soft(closing.open).toBe(false);
            expect.soft(closing.calls).toHaveLength(2);
          }
          // The pin can commit deferred ending after the first raw frame.
          // Both branches still require ending at frame2 below.
          if (!reference) expect.soft(close.frame1.ending).toBe(true);
          expect.soft(close.frame2.animations).toHaveLength(1);
          const keys = scenario.startsWith('beforematch-keys');
          expect
            .soft(
              keys
                ? close.immediate.computedAnimationDuration
                : close.immediate.computedTransitionDuration,
            )
            .toBe('0.123s');
          expect
            .soft(keys ? close.immediate.animationDuration : close.immediate.transitionDuration)
            .toBe(scenario === 'beforematch-keys-class' ? '' : '123ms');
          expect.soft(close.frame1.measuredHeight).toMatch(/^\d+(?:\.\d+)?px$/);
          expect.soft(close.frame2.ending).toBe(true);
          expect.soft(close.completion).toHaveLength(1);
          expect.soft(close.completed.calls[1]).toMatchObject({
            open: false,
            reason: 'trigger-press',
            type: 'click',
            before: 'true',
            canceled: false,
          });
          expect.soft(close.completed.order).toEqual(['change', 'consumer', 'change']);
          expect.soft(close.completion.every((result) => result.status === 'fulfilled')).toBe(true);
          expect.soft(close.completed.ending).toBe(false);
          expect.soft(close.completed.hidden).toBe('until-found');
          if (reference) {
            // The pinned class keyframe can restart as hidden dimensions return to auto.
            // Preserve its complete timing observation while checking the closed motion owner.
            expect.soft(close.completed.animations.length).toBeLessThanOrEqual(1);
            for (const animation of close.completed.animations) {
              expect.soft(animation).toMatchObject({
                kind: 'CSSAnimation',
                name: 'panel-slide-up',
              });
            }
          } else {
            expect.soft(close.completed.animations).toHaveLength(0);
          }
        }
      } catch (error) {
        const failure = { route, error: String(error) };
        routeFailures.push(failure);
        record('route-failure', failure);
      }
    }

    route = 'native-controlled-baseline';
    await page.goto('/native-snippets');
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const nativeTrigger = page.getByRole('button', { name: 'Native request toggle', exact: true });
    const nativeContent = page.getByTestId('native-controlled-content');
    const nativeRequests = page.getByTestId('native-controlled-requests');
    record('initial', {
      expanded: await nativeTrigger.getAttribute('aria-expanded'),
      contentCount: await nativeContent.count(),
      requests: await nativeRequests.textContent(),
    });
    await expect.soft(nativeTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect.soft(nativeContent).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Native release controlled value', exact: true })
      .click();
    await expect.soft(nativeTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect.soft(nativeContent).toHaveCount(1);
    await expect.soft(nativeRequests).toHaveText('[]');
    record('released', {
      expanded: await nativeTrigger.getAttribute('aria-expanded'),
      contentCount: await nativeContent.count(),
      requests: await nativeRequests.textContent(),
    });
    await nativeTrigger.click();
    await expect.soft(nativeTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect.soft(nativeContent).toHaveCount(1);
    await expect.soft(nativeRequests).toHaveText('[{"open":false,"before":true}]');
    record('requested', {
      expanded: await nativeTrigger.getAttribute('aria-expanded'),
      contentCount: await nativeContent.count(),
      requests: await nativeRequests.textContent(),
    });

    route = 'Svelte:controlled-default';
    const { trigger, panel } = await setup(page, 'controlled-default', false);
    await expect.soft(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.soft(panel).toHaveCount(0);
    expect.soft(await calls(page)).toEqual([]);
    record('initial', {
      expanded: await trigger.getAttribute('aria-expanded'),
      panelCount: await panel.count(),
      calls: await calls(page),
    });
    await page.getByRole('button', { name: 'Release controlled value' }).click();
    await expect.soft(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.soft(panel).toHaveAttribute('data-open');
    expect.soft(await calls(page)).toEqual([]);
    record('released', {
      expanded: await trigger.getAttribute('aria-expanded'),
      panelCount: await panel.count(),
      calls: await calls(page),
    });
    await trigger.click();
    await expect.soft(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.soft(panel).toHaveAttribute('data-open');
    const requested = await calls(page);
    expect.soft(requested).toHaveLength(1);
    expect.soft(requested[0]).toMatchObject({
      open: false,
      before: 'true',
      reason: 'trigger-press',
      type: 'click',
      canceled: false,
      defaultPrevented: false,
      mouse: true,
      cancelType: 'function',
      allowType: 'function',
    });
    await expect.soft(page.getByTestId('order')).toHaveText('["consumer","change"]');
    record('requested', {
      expanded: await trigger.getAttribute('aria-expanded'),
      panelCount: await panel.count(),
      calls: requested,
      order: await page.getByTestId('order').textContent(),
    });
    expect
      .soft(
        consoleEvents.filter(
          (event) =>
            event.route === 'native-controlled-baseline' ||
            event.route === 'Svelte:controlled-default',
        ),
      )
      .toEqual([]);
    expect.soft(routeFailures).toEqual([]);
    expect.soft(errors).toEqual([]);
  } finally {
    const report = { observations, consoleEvents, errors, routeFailures };
    console.log(JSON.stringify({ diagnosticReport: report }));
    await testInfo.attach('native-collapsible-css-observations', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });
  }
});
