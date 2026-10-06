// Test-only transport selected by the immutable Original renderer, MIT.
// Event construction and user input stay owned by the pinned Testing Library packages.
import {
  configure,
  fireEvent,
  getByText,
  getConfig,
  waitFor,
  type EventType,
} from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { flushSync, tick } from 'svelte';
import { isSourceVisible } from './navigation-menu-source-visibility.js';

type ReferenceTransport = {
  fireEvent: typeof fireEvent;
  act(callback: () => Promise<void>): PromiseLike<void>;
  configuration: ReturnType<typeof getConfig>;
};
type InputMethod = 'click' | 'hover' | 'unhover' | 'keyboard' | 'tab' | 'pointer';
export type NavigationMenuTestTransport = ReturnType<typeof createNavigationMenuTestTransport>;

export function createNavigationMenuTestTransport() {
  const previousConfig = getConfig();
  const previousActEnvironment = Object.getOwnPropertyDescriptor(
    globalThis,
    'IS_REACT_ACT_ENVIRONMENT',
  );
  const documentSymbols = new Set(Object.getOwnPropertySymbols(document));
  const prototypeDescriptors = Object.getOwnPropertyDescriptors(HTMLElement.prototype);
  const prototypeSymbols = new Set(Object.getOwnPropertySymbols(HTMLElement.prototype));
  const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const listeners: Array<
    [string, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined]
  > = [];
  let reference: ReferenceTransport | undefined;
  let user: ReturnType<typeof userEvent.setup> | undefined;
  let uncheckedUser: ReturnType<typeof userEvent.setup> | undefined;
  let activeElementSymbols: Set<symbol> | undefined;
  let setupActiveElement: Element | null = null;
  let finishClock: (() => void) | undefined;
  let clockAct: PromiseLike<void> | undefined;
  let unmountRoot: (() => void | Promise<void>) | undefined;
  const disposers: Array<() => void> = [];

  function setup(pointerEventsCheck?: 0) {
    // userEvent.setup adds its two document preparation listeners. Own those exact
    // listeners without duplicating user-event's focus, pointer or keyboard bodies.
    const original = document.addEventListener;
    const ownAddEventListener = Object.getOwnPropertyDescriptor(document, 'addEventListener');
    document.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (listener) listeners.push([type, listener, options]);
      if (listener) original.call(this, type, listener, options);
    };
    try {
      return userEvent.setup({
        document,
        ...(pointerEventsCheck === 0 ? { pointerEventsCheck } : {}),
      });
    } finally {
      if (ownAddEventListener)
        Object.defineProperty(document, 'addEventListener', ownAddEventListener);
      else Reflect.deleteProperty(document, 'addEventListener');
    }
  }
  function ready(
    selectedReference?: ReferenceTransport,
    selectedUnmount?: () => void | Promise<void>,
  ) {
    reference = selectedReference;
    unmountRoot = selectedUnmount;
    if (reference) {
      // Preserve the actual pure.js configuration across fixture remounts: its
      // module is cached, while each fixture restores its prior global config.
      configure(reference.configuration);
    }
    setupActiveElement = document.activeElement;
    activeElementSymbols = new Set(
      setupActiveElement ? Object.getOwnPropertySymbols(setupActiveElement) : [],
    );
    user = setup();
  }
  async function flush() {
    if (reference) await reference.act(async () => {});
    else await tick();
  }
  function beginClock() {
    if (!reference) return;
    if (finishClock) throw new Error('A fixture clock act is already active');
    const elapsed = new Promise<void>((resolve) => {
      finishClock = resolve;
    });
    // The host advances its owned Playwright clock while this real React act is
    // open. This is the browser counterpart of Source clock.tickAsync's act.
    clockAct = reference.act(async () => {
      await elapsed;
    });
  }
  async function endClock() {
    finishClock?.();
    finishClock = undefined;
    await clockAct;
    clockAct = undefined;
    await flush();
  }
  async function mutate(callback: () => void | Promise<unknown>) {
    if (reference)
      await reference.act(async () => {
        await callback();
      });
    else {
      await callback();
      await tick();
    }
  }
  async function fire(
    target: Element | Document | Window,
    event: string,
    init: Record<string, unknown> = {},
  ) {
    const selected = reference?.fireEvent ?? fireEvent;
    const method = Object.keys(selected).find(
      (key) => key.toLowerCase() === event.toLowerCase(),
    ) as EventType | undefined;
    if (!method) throw new Error(`Unknown Testing Library event: ${event}`);
    if ((method === 'keyDown' || method === 'keyUp') && target !== document.activeElement) {
      throw new Error('Original keyboard fireEvent requires the active element as its target');
    }
    selected[method](target, init);
    await flush();
  }
  function fireSync(
    target: Element | Document | Window,
    event: string,
    init: Record<string, unknown> = {},
  ) {
    const selected = reference?.fireEvent ?? fireEvent;
    const method = Object.keys(selected).find(
      (key) => key.toLowerCase() === event.toLowerCase(),
    ) as EventType | undefined;
    if (!method) throw new Error(`Unknown Testing Library event: ${event}`);
    if ((method === 'keyDown' || method === 'keyUp') && target !== document.activeElement) {
      throw new Error('Original keyboard fireEvent requires the active element as its target');
    }
    // Original's wrapped fireEvent commits synchronously. Native flushSync commits
    // its real DOM event so immediate Source geometry setup precedes microtasks.
    if (reference) selected[method](target, init);
    else
      flushSync(() => {
        selected[method](target, init);
      });
  }
  async function input(
    method: InputMethod,
    target: Element | null = null,
    options: {
      text?: string;
      shift?: boolean;
      releasePrevious?: boolean;
      pointerEventsCheck?: 0;
    } = {},
  ) {
    const selected = options.pointerEventsCheck === 0 ? (uncheckedUser ??= setup(0)) : user;
    if (!selected) throw new Error('Fixture transport is not ready');
    if (method === 'keyboard') await selected.keyboard(options.text ?? '');
    else if (method === 'tab') await selected.tab({ shift: options.shift });
    else {
      if (!target) throw new Error(`${method} needs its literal target`);
      if (method === 'pointer')
        await selected.pointer([{ target, releasePrevious: options.releasePrevious }]);
      else await selected[method](target);
    }
    await flush();
  }
  async function pointer(
    actions: Array<{ target: Element; releasePrevious?: boolean }>,
    options: { pointerEventsCheck?: 0 } = {},
  ) {
    const selected = options.pointerEventsCheck === 0 ? (uncheckedUser ??= setup(0)) : user;
    if (!selected) throw new Error('Fixture transport is not ready');
    // Source sends its rapid traversal as one literal user.pointer action array.
    await selected.pointer(actions);
    await flush();
  }
  async function dispose() {
    finishClock?.();
    finishClock = undefined;
    await clockAct;
    clockAct = undefined;
    const unmount = unmountRoot;
    unmountRoot = undefined;
    await unmount?.();
    for (const dispose of disposers.splice(0).reverse()) dispose();
    for (const [type, listener, options] of listeners)
      document.removeEventListener(type, listener, options);
    for (const symbol of Object.getOwnPropertySymbols(document))
      if (!documentSymbols.has(symbol)) Reflect.deleteProperty(document, symbol);
    for (const symbol of Object.getOwnPropertySymbols(HTMLElement.prototype))
      if (!prototypeSymbols.has(symbol)) Reflect.deleteProperty(HTMLElement.prototype, symbol);
    for (const key of ['focus', 'blur'])
      Object.defineProperty(HTMLElement.prototype, key, prototypeDescriptors[key]);
    if (setupActiveElement && activeElementSymbols)
      for (const symbol of Object.getOwnPropertySymbols(setupActiveElement))
        if (!activeElementSymbols.has(symbol)) Reflect.deleteProperty(setupActiveElement, symbol);
    if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
    configure(previousConfig);
    if (previousActEnvironment)
      Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment);
    else Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
    user = undefined;
    uncheckedUser = undefined;
  }
  return {
    ready,
    isReady: () => Boolean(user),
    fire,
    fireSync,
    input,
    pointer,
    flush,
    mutate,
    waitFor,
    getByText,
    isSourceVisible,
    beginClock,
    endClock,
    onDispose: (callback: () => void) => {
      disposers.push(callback);
    },
    dispose,
  };
}
