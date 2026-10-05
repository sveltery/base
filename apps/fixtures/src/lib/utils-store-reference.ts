// Actual immutable Base UI1.8.0 Utils0.4.0 ReactStore reference; supplemental comparison only.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ReactStore } from '@base-ui/utils/store';

export function mountUtilsStoreReference(target: HTMLElement, initialValue: number, cleanup: boolean) {
  const store = new ReactStore<{ value: number | undefined }>({ value: 0 });
  const notifications: (number | undefined)[] = [];
  const unsubscribe = store.subscribe(state => notifications.push(state.value));
  const root = createRoot(target);
  function Owner({ value }: { value: number }) {
    if (cleanup) store.useSyncedValueWithCleanup('value', value);
    else store.useSyncedValue('value', value);
    return React.createElement('output', null, 'Store synchronization owner');
  }
  const updateValue = (value: number) => flushSync(() => root.render(React.createElement(Owner, { value })));
  updateValue(initialValue);
  return {
    store, notifications, updateValue,
    stop() { flushSync(() => root.unmount()); unsubscribe(); },
  };
}
