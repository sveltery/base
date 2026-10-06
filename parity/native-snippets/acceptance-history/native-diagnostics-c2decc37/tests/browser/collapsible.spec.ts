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
