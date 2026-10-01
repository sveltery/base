// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-explicit-any -- Preserve pinned generic defaults and private event payload erasure. */
import { createIdGenerator } from './id.js';
import type {
  ToastObject,
  ToastManagerAddOptions,
  ToastManagerPromiseOptions,
  ToastManagerUpdateOptions,
} from './types.js';

/**
 * Creates a new toast manager.
 */
export function createToastManager<Data extends object = any>(): ToastManager<Data> {
  const generateId = createIdGenerator();
  const listeners = new Set<(data: ToastManagerEvent) => void>();

  function emit(data: ToastManagerEvent) {
    listeners.forEach((listener) => listener(data));
  }

  return {
    // This should be private aside from ToastProvider needing to access it.
    // https://x.com/drosenwasser/status/1816947740032872664
    ' subscribe': function subscribe(listener: (data: ToastManagerEvent) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    add<T extends Data = Data>(options: ToastManagerAddOptions<T>): string {
      const id = options.id || generateId();
      const toastToAdd: ToastObject<T> = {
        ...options,
        id,
        transitionStatus: 'starting',
      };

      emit({
        action: 'add',
        options: toastToAdd,
      });

      return id;
    },

    close(id?: string): void {
      emit({
        action: 'close',
        options: { id },
      });
    },

    update<T extends Data = Data>(
      id: string,
      updates:
        | ToastManagerUpdateOptions<T>
        | ((prevToast: ToastObject<T>) => ToastManagerUpdateOptions<T>),
    ): void {
      emit({
        action: 'update',
        options: { id, updates },
      });
    },

    promise<Value, T extends Data = Data>(
      promiseValue: Promise<Value>,
      options: ToastManagerPromiseOptions<Value, T>,
    ): Promise<Value> {
      let handledPromise = promiseValue;

      emit({
        action: 'promise',
        options: {
          ...options,
          promise: promiseValue,
          setPromise(promise: Promise<Value>) {
            handledPromise = promise;
          },
        },
      });

      return handledPromise;
    },
  };
}

export interface ToastManager<Data extends object = any> {
  ' subscribe': (listener: (data: ToastManagerEvent) => void) => () => void;
  add: <T extends Data = Data>(options: ToastManagerAddOptions<T>) => string;
  close: (id?: string) => void;
  update: <T extends Data = Data>(
    id: string,
    updates:
      ToastManagerUpdateOptions<T> | ((prevToast: ToastObject<T>) => ToastManagerUpdateOptions<T>),
  ) => void;
  promise: <Value, T extends Data = Data>(
    promiseValue: Promise<Value>,
    options: ToastManagerPromiseOptions<Value, T>,
  ) => Promise<Value>;
}

/** Internal channel payloads, discriminated for the Provider bridge. */
export type ToastManagerEvent =
  | { action: 'add'; options: ToastObject<any> }
  | { action: 'close'; options: { id?: string } }
  | { action: 'update'; options: { id: string; updates: ToastManagerUpdateOptions<any> | ((previous: ToastObject<any>) => ToastManagerUpdateOptions<any>) } }
  | { action: 'promise'; options: ToastManagerPromiseOptions<any, any> & { promise: Promise<any>; setPromise(promise: Promise<any>): void } };
