import { writeFileSync } from 'node:fs';
import { expect, type Page, type TestInfo } from '@playwright/test';

type ExitSample = {
  time: number;
  caller: string | undefined;
  array: number;
  ending: boolean;
  animations: {
    animation: number;
    type: string;
    property: string | null;
    targetIsPopup: boolean;
    duration: number | string | undefined;
    currentTime: Animation['currentTime'];
    pending: boolean;
    playState: AnimationPlayState;
  }[];
};
type ExitCapture = {
  observed: boolean;
  animations: number;
  readonly paused: boolean;
  readonly unresolved: boolean;
  samples: ExitSample[];
  captured: { animation: number; finishedPromise: number; paused: boolean; time: number }[];
  settlements: {
    animation: number;
    finishedPromise: number;
    state: string;
    time: number;
    error?: string;
  }[];
  resume(): void;
  cleanup(): void;
};
type ExitWindow = Window & { dialogExitAnimation?: ExitCapture };

// The fixture's open callback can precede its physical CSS opening. Observe
// actual native completion and rendered state before testing a pending exit.
export async function waitForOpeningAnimations(page: Page) {
  const popup = page.getByTestId('popup');
  await expect(popup).not.toHaveAttribute('data-starting-style', '');
  await popup.evaluate(async (node) => {
    await Promise.all(node.getAnimations().map((animation) => animation.finished));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  await expect(popup).toHaveCSS('opacity', '1');
  await expect
    .poll(() =>
      popup.evaluate(
        (node) =>
          node
            .getAnimations()
            .filter((animation) => animation.pending || animation.playState !== 'finished').length,
      ),
    )
    .toBe(0);
  console.log(
    'DIALOG_OPENING_SETTLED',
    await popup.evaluate((node) => ({
      opacity: getComputedStyle(node).opacity,
      starting: node.hasAttribute('data-starting-style'),
      unfinished: node
        .getAnimations()
        .filter((animation) => animation.pending || animation.playState !== 'finished').length,
    })),
  );
}

export async function captureExitAnimation(page: Page, pause: boolean) {
  await page.getByTestId('popup').evaluate((node, shouldPause) => {
    const original = node.getAnimations;
    const descriptor = Object.getOwnPropertyDescriptor(node, 'getAnimations');
    const identities = new WeakMap<object, number>();
    let nextIdentity = 1;
    function identity(value: object) {
      if (!identities.has(value)) identities.set(value, nextIdentity++);
      return identities.get(value)!;
    }
    function restore() {
      if (node.getAnimations !== wrapped) return;
      if (descriptor) Object.defineProperty(node, 'getAnimations', descriptor);
      else Reflect.deleteProperty(node, 'getAnimations');
    }
    let captured: Animation[] = [];
    const finished = new Map<Animation, string>();
    const result: ExitCapture = {
      observed: false,
      animations: 0,
      get paused() {
        return (
          captured.length > 0 && captured.every((animation) => animation.playState === 'paused')
        );
      },
      get unresolved() {
        return (
          captured.length > 0 &&
          captured.every((animation) => finished.get(animation) === 'pending')
        );
      },
      samples: [],
      captured: [],
      settlements: [],
      resume() {
        captured.forEach((animation) => animation.play());
      },
      cleanup() {
        restore();
        // Failed assertions must release only this probe's still-live pause.
        // Never restart an animation canceled by reopening or removal.
        const live = Reflect.apply(original, node, []) as Animation[];
        for (const animation of captured) {
          if (animation.playState === 'paused' && live.includes(animation)) animation.play();
        }
      },
    };
    (window as ExitWindow).dialogExitAnimation = result;
    function wrapped(this: Element, ...args: Parameters<Element['getAnimations']>) {
      const animations = Reflect.apply(original, this, args) as Animation[];
      result.samples.push({
        time: performance.now(),
        caller: new Error('actual completion-hook animation sample').stack,
        array: identity(animations),
        ending: node.hasAttribute('data-ending-style'),
        animations: animations.map((animation) => ({
          animation: identity(animation),
          type: animation.constructor.name,
          property: animation instanceof CSSTransition ? animation.transitionProperty : null,
          targetIsPopup:
            animation.effect instanceof KeyframeEffect && animation.effect.target === node,
          duration: animation.effect?.getTiming().duration,
          currentTime: animation.currentTime,
          pending: animation.pending,
          playState: animation.playState,
        })),
      });
      if (!result.observed && node.hasAttribute('data-closed')) {
        const pending = animations.filter(
          (animation) =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === 'opacity' &&
            animation.effect instanceof KeyframeEffect &&
            animation.effect.target === node &&
            (animation.pending || animation.playState === 'running'),
        );
        if (pending.length) {
          captured = pending;
          // Pause these exact native objects before the Source caller obtains
          // their real .finished promises. Return its original array unchanged.
          if (shouldPause) captured.forEach((animation) => animation.pause());
          captured.forEach((animation) => {
            const promise = animation.finished;
            const ids = { animation: identity(animation), finishedPromise: identity(promise) };
            result.captured.push({
              ...ids,
              paused: animation.playState === 'paused',
              time: performance.now(),
            });
            finished.set(animation, 'pending');
            void promise.then(
              () => {
                finished.set(animation, 'fulfilled');
                result.settlements.push({ ...ids, state: 'fulfilled', time: performance.now() });
              },
              (error: unknown) => {
                finished.set(animation, 'rejected');
                result.settlements.push({
                  ...ids,
                  state: 'rejected',
                  time: performance.now(),
                  error: String(error),
                });
              },
            );
          });
          result.observed = true;
          result.animations = animations.length;
          restore();
        }
      }
      return animations;
    }
    node.getAnimations = wrapped;
  }, pause);
}

export async function exitAnimation(page: Page) {
  return page.evaluate(() => {
    const result = (window as ExitWindow).dialogExitAnimation!;
    return {
      observed: result.observed,
      animations: result.animations,
      paused: result.paused,
      unresolved: result.unresolved,
      samples: result.samples,
      captured: result.captured,
      settlements: result.settlements,
    };
  });
}

export async function resumeExitAnimation(page: Page) {
  await page.evaluate(() => (window as ExitWindow).dialogExitAnimation!.resume());
}

export async function cleanupExitAnimation(page: Page, info: TestInfo) {
  const receipt = await page.evaluate(() => {
    const result = (window as ExitWindow).dialogExitAnimation;
    if (!result) return null;
    return {
      observed: result.observed,
      paused: result.paused,
      unresolved: result.unresolved,
      samples: result.samples,
      captured: result.captured,
      settlements: result.settlements,
    };
  });
  try {
    if (receipt) {
      const body = JSON.stringify({ test: info.title, ...receipt }, null, 2);
      writeFileSync(info.outputPath('exit-animation-timeline.json'), body + '\n');
      await info.attach('actual-exit-animation-timeline', {
        body,
        contentType: 'application/json',
      });
      console.log('DIALOG_EXIT_SOURCE_RECEIPT', body);
    }
  } finally {
    await page.evaluate(() => (window as ExitWindow).dialogExitAnimation?.cleanup());
  }
}
