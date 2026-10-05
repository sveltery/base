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

// Browser counterpart of Source vi.spyOn(style, 'setProperty'): call the actual
// DOM method, retain its arguments, and restore the exact own descriptor.
export function spySetProperty(style: CSSStyleDeclaration) {
  const descriptor = Object.getOwnPropertyDescriptor(style, 'setProperty');
  const original = style.setProperty;
  const calls: Array<[property: string, value: string | null, priority?: string]> = [];
  style.setProperty = function (property, value, priority) {
    calls.push([property, value, priority]);
    return original.call(this, property, value, priority);
  };
  return {
    calls,
    restore() {
      if (descriptor) Object.defineProperty(style, 'setProperty', descriptor);
      else Reflect.deleteProperty(style, 'setProperty');
    },
  };
}

function getPopupWidthCalls(calls: Array<[property: string, value: string, priority?: string]>) {
  return calls.filter((call) => call[0] === '--popup-width').map((call) => call[1]);
}

function getPositionerWidthCalls(
  calls: Array<[property: string, value: string, priority?: string]>,
) {
  return calls.filter((call) => call[0] === '--positioner-width').map((call) => call[1]);
}
export { getPopupWidthCalls, getPositionerWidthCalls };
