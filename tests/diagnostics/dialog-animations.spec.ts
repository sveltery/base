import { expect, test, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

type AnimationDiagnostic = {
  events: Record<string, unknown>[];
  checkpoint(label: string): void;
  cleanup(): void;
};
type DiagnosticWindow = Window & { dialogAnimationDiagnostic?: AnimationDiagnostic };

async function installDiagnostic(page: Page) {
  await page.getByTestId('popup').evaluate((node) => {
    const original = node.getAnimations;
    const descriptor = Object.getOwnPropertyDescriptor(node, 'getAnimations');
    const events: Record<string, unknown>[] = [];
    const identities = new WeakMap<object, number>();
    let nextIdentity = 0;
    const identity = (value: object) => {
      if (!identities.has(value)) identities.set(value, ++nextIdentity);
      return identities.get(value)!;
    };
    const watched = new WeakSet<Promise<Animation>>();
    const state = () => ({
      open: node.hasAttribute('data-open'),
      closed: node.hasAttribute('data-closed'),
      starting: node.hasAttribute('data-starting-style'),
      ending: node.hasAttribute('data-ending-style'),
      hidden: node.hasAttribute('hidden'),
      connected: node.isConnected,
      activeElement: document.activeElement?.id,
      log: document.querySelector('[data-testid=log]')?.textContent,
    });
    const record = (kind: string, detail: Record<string, unknown> = {}) => {
      events.push({ time: performance.now(), kind, ...state(), ...detail });
    };
    const describe = (animation: Animation, promise: Promise<Animation>) => {
      const effect = animation.effect;
      const target = effect instanceof KeyframeEffect ? effect.target : null;
      return {
        animation: identity(animation),
        finishedPromise: identity(promise),
        type: animation.constructor.name,
        transitionProperty:
          animation instanceof CSSTransition ? animation.transitionProperty : null,
        targetIsPopup: target === node,
        target:
          target instanceof Element ? (target.getAttribute('data-testid') ?? target.id) : null,
        duration: effect?.getTiming().duration,
        currentTime: animation.currentTime,
        startTime: animation.startTime,
        pending: animation.pending,
        playState: animation.playState,
      };
    };
    const sample = (animations: Animation[]) =>
      animations.map((animation) => {
        const promise = animation.finished;
        if (!watched.has(promise)) {
          watched.add(promise);
          void promise.then(
            () => record('native-finished-fulfilled', describe(animation, promise)),
            (error: unknown) =>
              record('native-finished-rejected', {
                ...describe(animation, promise),
                error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
              }),
          );
        }
        return describe(animation, promise);
      });
    node.getAnimations = function (...args) {
      const animations = Reflect.apply(original, this, args) as Animation[];
      record('element-getAnimations', {
        caller: new Error('actual element getAnimations caller').stack,
        arguments: args,
        array: identity(animations),
        animations: sample(animations),
      });
      // Return the captured original array and objects unchanged. The diagnostic
      // only observes the native finished promises; it never substitutes them.
      return animations;
    };
    const observer = new MutationObserver((mutations) => {
      record('observer-dom-mutation', {
        attributes: mutations
          .filter((mutation) => mutation.type === 'attributes')
          .map((mutation) => ({ name: mutation.attributeName, previous: mutation.oldValue })),
      });
    });
    observer.observe(node, { attributes: true, attributeOldValue: true });
    const logObserver = new MutationObserver(() => record('observer-completion-log'));
    logObserver.observe(document.querySelector('[data-testid=log]')!, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    let frame = 0;
    const onFrame = () => {
      // Attribute/log observations do not independently sample animations or
      // force style resolution before the completion hook's real sample.
      record('observer-rAF');
      frame = requestAnimationFrame(onFrame);
    };
    frame = requestAnimationFrame(onFrame);
    const diagnostic: AnimationDiagnostic = {
      events,
      checkpoint(label) {
        const animations = Reflect.apply(original, node, []) as Animation[];
        record('observer-explicit-checkpoint', {
          label,
          array: identity(animations),
          animations: sample(animations),
          opacity: getComputedStyle(node).opacity,
          transitionDuration: getComputedStyle(node).transitionDuration,
          reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        });
      },
      cleanup() {
        observer.disconnect();
        logObserver.disconnect();
        cancelAnimationFrame(frame);
        if (descriptor) Object.defineProperty(node, 'getAnimations', descriptor);
        else Reflect.deleteProperty(node, 'getAnimations');
        record('diagnostic-cleanup');
      },
    };
    (window as DiagnosticWindow).dialogAnimationDiagnostic = diagnostic;
    record('diagnostic-installed');
  });
}

for (const route of ['/dialog', '/reference']) {
  test(`${route}: record original early-close physical animation samples`, async ({
    page,
  }, info) => {
    await page.goto(`${route}?keep&animate`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await installDiagnostic(page);
    try {
      await page.locator('#trigger').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      // Reproduce the failed authored setup: an open callback is the only
      // completion precondition. There is no opening wait or animation pause.
      await page.waitForFunction(() =>
        JSON.parse(document.querySelector('[data-testid=log]')!.textContent!).some(
          (entry: { channel: string; open?: boolean }) =>
            entry.channel === 'complete' && entry.open,
        ),
      );
      await page.evaluate(() =>
        (window as DiagnosticWindow).dialogAnimationDiagnostic!.checkpoint('before-escape'),
      );
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByTestId('popup')).toBeHidden();
      await expect(page.locator('#trigger')).toBeFocused();
      await expect
        .poll(async () =>
          JSON.parse(await page.getByTestId('log').innerText())
            .filter((entry: { channel: string }) => entry.channel === 'complete')
            .map((entry: { open: boolean }) => entry.open),
        )
        .toEqual([true, false]);
    } finally {
      const events = await page.evaluate(() => {
        const diagnostic = (window as DiagnosticWindow).dialogAnimationDiagnostic!;
        diagnostic.checkpoint('after-close-observation');
        diagnostic.cleanup();
        return diagnostic.events;
      });
      const report = {
        route,
        purpose: 'Physical browser diagnosis; no ordinary Source credit',
        events,
      };
      const body = JSON.stringify(report, null, 2);
      writeFileSync(info.outputPath('animation-timeline.json'), body + '\n');
      await info.attach('actual-animation-timeline', { body, contentType: 'application/json' });
      console.log(`DIALOG_ANIMATION_DIAGNOSTIC ${JSON.stringify(report)}`);
    }
  });
}
