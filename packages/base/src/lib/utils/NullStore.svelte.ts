// Base UI v1.8.0 NullStore business body; native SvelteStore framework boundary.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { SvelteStore } from '@sveltery/utils/store';
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Component selectors keep typed argument/return signatures.
type Selector<State> = (state: State, ...args: any[]) => any;
export class NullStore<
  State extends object,
  Context,
  Selectors extends Record<string, Selector<State>>,
> extends SvelteStore<State, Context, Selectors> {
  override setState(_newState: State) {}
  override update<const Key extends keyof State>(_changes: Pick<State, Key>) {}
  override set<Key extends keyof State>(_key: Key, _value: State[Key]) {}
  override notifyAll() {}
}
