<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { Timeout } from '@sveltery/utils/useTimeout';
  import { ValueChanged } from '../../src/lib/internals/ValueChanged.svelte.js';
  import Child from './SharedSourceUtilsChild.svelte';

  let { initialControlled, initialDefault, events = [] }: {
    initialControlled?: unknown;
    initialDefault?: unknown;
    events?: string[];
  } = $props();
  let controlled = $state.raw<unknown>(untrack(() => initialControlled));
  let defaultValue = $state.raw<unknown>(untrack(() => initialDefault));
  let owner = $state('old');
  let ownerCallback = $state.raw<(value: string) => string>((value) => value);
  let changedValue = $state.raw({ value: 0 });
  let dependency = $state.raw({ value: 0 });
  let unrelated = $state(0);
  let callbackOnlyValue = $state(0);
  let effectRuns = 0;
  let effectCleanups = 0;
  let stableEffectRuns = 0;
  let initialized = 0;
  let changePrevious: number[] = [];
  let readsInsideCallback: number[] = [];
  let mutateDuringChange = false;
  let valueChangeCallback = $state.raw<((previous: number) => void) | undefined>((previous) => {
    changePrevious.push(previous);
    readsInsideCallback.push(changedValue.value);
    if (mutateDuringChange && changedValue.value === 1) changedValue = { value: 2 };
  });

  const valueState = new Controlled(() => controlled, untrack(() => defaultValue));
  initialized += 1;
  const ref = { current: { seed: 'seed' } };
  const stable = () => ownerCallback(owner);
  const timeout = new Timeout();
  onDestroy(timeout.clear);
  untrack(() => events.push(`parent-setup:${stable()}`));

  $effect(() => {
    events.push(`parent-effect:${stable()}`);
    return () => { events.push('parent-cleanup'); };
  });

  $effect(() => {
    effectRuns += 1;
    void dependency.value;
    void callbackOnlyValue;
    return () => { effectCleanups += 1; };
  });

  $effect(() => {
    stableEffectRuns += 1;
    stable();
  });

  new ValueChanged(() => changedValue.value, () => valueChangeCallback);

  export const setControlled = (next: unknown) => { controlled = next; };
  export const setDefault = (next: unknown) => { defaultValue = next; };
  export const setLocal = (next: unknown) => { valueState.set(next); };
  export const incrementLocal = () => { valueState.set(Number(valueState.value) + 1); };
  export const setOwner = (next: string) => { owner = next; };
  export const replaceCallback = () => { ownerCallback = (next) => `replacement:${next}`; };
  export const getStable = () => stable;
  export const callOptional = () => undefined;
  export const setChanged = (next: number) => { changedValue = { value: next }; };
  export const setValueChangeCallback = (next: ((previous: number) => void) | undefined) => {
    valueChangeCallback = next;
  };
  export const mutateOnChange = () => { mutateDuringChange = true; };
  export const setDependency = (next: number) => { dependency = { value: next }; };
  export const setUnrelated = (next: number) => { unrelated = next; };
  export const setCallbackRead = (next: number) => { callbackOnlyValue = next; };
  export const start = (delay: number, callback: () => void) => { timeout.start(delay, callback); };
  export const timerStarted = () => timeout.isStarted();
  export const updateRef = (seed: string) => { ref.current = { seed }; };
  export const snapshot = () => ({
    value: valueState.value, initialized, ref: ref.current, effectRuns, effectCleanups,
    stableEffectRuns, changePrevious, readsInsideCallback,
  });
</script>

<output data-value>{String(valueState.value)}</output>
<Child {stable} {events} />
