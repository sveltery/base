// Exact Original test mock bodies at47b40521; MIT. Used only by Source browser fixtures.
function mockBoundingClientRect(
  element: Element,
  rect: { x: number; y: number; width: number; height: number },
) {
  const domRect = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    top: rect.y,
    left: rect.x,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
    toJSON: () => ({}),
  };

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => domRect,
  });
}

function mockAnimations(element: HTMLElement) {
  type MockAnimation = {
    finished: Promise<void>;
    resolveFinished: (() => void) | null;
  };

  function createAnimation(): MockAnimation {
    let resolveFinished: (() => void) | null = null;

    return {
      finished: new Promise<void>((resolve) => {
        resolveFinished = resolve;
      }),
      resolveFinished,
    };
  }

  let currentAnimation = createAnimation();
  let activeAnimations: MockAnimation[] = [];

  Object.defineProperty(element, 'getAnimations', {
    configurable: true,
    value: () =>
      activeAnimations.map((animation) => ({
        finished: animation.finished,
      })),
  });

  return {
    start() {
      currentAnimation = createAnimation();
      activeAnimations.push(currentAnimation);
      return currentAnimation;
    },
    finish(animation: MockAnimation = currentAnimation) {
      const finished = animation.finished;
      animation.resolveFinished?.();
      animation.resolveFinished = null;
      activeAnimations = activeAnimations.filter((item) => item !== animation);
      return finished;
    },
  };
}

function mockResizeObserver() {
  const originalResizeObserver = globalThis.ResizeObserver;

  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  return () => {
    globalThis.ResizeObserver = originalResizeObserver;
  };
}

function primeOpenPopupSize(
  popupRoot: HTMLElement,
  positioner: HTMLElement,
  width: number,
  height: number,
) {
  popupRoot.style.setProperty('--popup-width', 'auto');
  popupRoot.style.setProperty('--popup-height', 'auto');
  positioner.style.setProperty('--positioner-width', `${width}px`);
  positioner.style.setProperty('--positioner-height', `${height}px`);
}
export { mockBoundingClientRect, mockAnimations, mockResizeObserver, primeOpenPopupSize };
