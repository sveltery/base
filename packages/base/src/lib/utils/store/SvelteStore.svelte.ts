// Native state/context adapter for Base UI v1.8.0 ReactStore at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { DEV } from 'esm-env';
import { Store } from './Store.svelte.js';
import { useIsoLayoutEffect } from '../useIsoLayoutEffect.svelte.js';
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Selector signatures retain their own typed argument/return contracts.
type Selector<State> = (state: State, ...args: any[]) => any;
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : [];
type SelectorArgs<F> = F extends (...args: infer A) => unknown ? Tail<A> : never;

/** Original Store business mutations with native reactive snapshot reads and live context. */
export class SvelteStore<State extends object, Context, Selectors extends Record<string, Selector<State>>> extends Store<State> {
  constructor(state: State, readonly context: Context, private readonly selectors: Selectors) { super(state); }
  select<Key extends keyof Selectors>(key: Key, ...args: SelectorArgs<Selectors[Key]>): ReturnType<Selectors[Key]> {
    return this.selectors[key](this.state, ...args);
  }
  /** Native runes track a selected read directly; no external React subscription adapter. */
  useState<Key extends keyof Selectors>(key: Key, ...args: SelectorArgs<Selectors[Key]>): ReturnType<Selectors[Key]> {
    return this.select(key, ...args);
  }
  useSyncedValue<Key extends keyof State>(key: Key, getValue: () => State[Key]) {
    useIsoLayoutEffect(() => { this.set(key, getValue()); }, () => [getValue()]);
  }
  useSyncedValues<const Key extends keyof State>(getValues: () => Pick<State, Key>) {
    useIsoLayoutEffect(() => { this.update(getValues()); }, () => Object.values(getValues()));
  }
  useControlledProp<Key extends keyof State>(key: Key, getControlled: () => State[Key] | undefined) {
    const initiallyControlled = untrack(() => getControlled() !== undefined);
    useIsoLayoutEffect(() => {
      const controlled = getControlled();
      if (controlled !== undefined && !Object.is(this.state[key], controlled)) this.set(key, controlled);
    }, () => [getControlled()]);
    if (DEV) $effect(() => {
      const isControlled = getControlled() !== undefined;
      if (initiallyControlled !== isControlled) console.error(`A component is changing the ${isControlled ? '' : 'un'}controlled state of ${String(key)} to be ${isControlled ? 'un' : ''}controlled. Elements should not switch from uncontrolled to controlled (or vice versa).`);
    });
  }
  useStateSetter<Key extends keyof State>(key: Key) { return (value: State[Key]) => this.set(key, value); }
  observe<Key extends keyof Selectors>(key: Key, listener: (value: ReturnType<Selectors[Key]>, previous: ReturnType<Selectors[Key]>, store: this) => void) {
    let previous = this.select(key, ...[] as SelectorArgs<Selectors[Key]>);
    listener(previous, previous, this);
    return this.subscribe(() => {
      const value = this.select(key, ...[] as SelectorArgs<Selectors[Key]>);
      if (!Object.is(value, previous)) { const old = previous; previous = value; listener(value, old, this); }
    });
  }
}
