// Native state/context adapter for Base UI v1.8.0 ReactStore at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { createSubscriber } from 'svelte/reactivity';
import { DEV } from 'esm-env';
import { Store } from './Store.svelte.js';
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Selector signatures retain their own typed argument/return contracts.
type Selector<State> = (state: State, ...args: any[]) => any;
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : [];
type SelectorArgs<F> = F extends (...args: infer A) => unknown ? Tail<A> : never;
type KeysAllowingUndefined<State> = { [Key in keyof State]-?: undefined extends State[Key] ? Key : never }[keyof State];

/** Original Store business mutations with native reactive snapshot reads and live context. */
export class SvelteStore<State extends object, Context, Selectors extends Record<string, Selector<State>>> extends Store<State> {
  private readonly trackState = createSubscriber(update => this.subscribe(() => update()));
  constructor(state: State, readonly context: Context, private readonly selectors: Selectors) { super(state); }
  select<Key extends keyof Selectors>(key: Key, ...args: SelectorArgs<Selectors[Key]>): ReturnType<Selectors[Key]> {
    this.trackState();
    return this.selectors[key](this.state, ...args);
  }
  /** Native runes track a selected read directly; no external React subscription adapter. */
  useState<Key extends keyof Selectors>(key: Key, ...args: SelectorArgs<Selectors[Key]>): ReturnType<Selectors[Key]> {
    return this.select(key, ...args);
  }
  useSyncedValue<Key extends keyof State>(key: Key, getValue: () => State[Key]) {
    $effect(() => { const value = getValue(); untrack(() => this.set(key, value)); });
  }
  useSyncedValues<const Key extends keyof State>(getValues: () => Pick<State, Key>) {
    let keys: string[] | undefined;
    $effect(() => {
      const values = getValues();
      if (DEV) {
        const nextKeys = Object.keys(values);
        keys ??= nextKeys;
        if (keys.length !== nextKeys.length || keys.some((key, index) => key !== nextKeys[index])) {
          console.error('SvelteStore.useSyncedValues expects the same prop keys on every update. Keys should be stable.');
        }
      }
      untrack(() => this.update(values));
    });
  }
  useSyncedValueWithCleanup<Key extends KeysAllowingUndefined<State>>(key: Key, getValue: () => State[Key]) {
    $effect(() => { const value = getValue(); untrack(() => this.set(key, value)); return () => { this.set(key, undefined as State[Key]); }; });
  }
  useControlledProp<Key extends keyof State>(key: Key, getControlled: () => State[Key] | undefined) {
    const initiallyControlled = untrack(() => getControlled() !== undefined);
    $effect(() => {
      const controlled = getControlled();
      untrack(() => { if (controlled !== undefined) this.set(key, controlled); });
    });
    if (DEV) $effect(() => {
      const isControlled = getControlled() !== undefined;
      if (initiallyControlled !== isControlled) console.error(`A component is changing the ${isControlled ? '' : 'un'}controlled state of ${String(key)} to be ${isControlled ? 'un' : ''}controlled. Elements should not switch from uncontrolled to controlled (or vice versa).`);
    });
  }
  useStateSetter<Key extends keyof State>(key: Key) { return (value: State[Key]) => this.set(key, value); }
}
