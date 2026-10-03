<script lang="ts">
  import { untrack } from 'svelte';
  import { useControlled, type SetStateAction } from '../../src/lib/utils/useControlled.svelte.js';
  import { useStableCallback } from '../../src/lib/utils/useStableCallback.js';
  import { useTimeout } from '../../src/lib/utils/useTimeout.js';
  import { useRefWithInit } from '../../src/lib/utils/useRefWithInit.js';
  import { useIsoLayoutEffect } from '../../src/lib/utils/useIsoLayoutEffect.svelte.js';
  import { useValueChanged } from '../../src/lib/internals/useValueChanged.svelte.js';
  import Child from './SharedSourceUtilsChild.svelte';

  let { initialControlled, initialDefault, events = [] }: {
    initialControlled?: unknown;
    initialDefault?: unknown;
    events?: string[];
  } = $props();
  let controlled = $state.raw<unknown>(untrack(() => initialControlled));
  let defaultValue = $state.raw<unknown>(untrack(() => initialDefault));
  let name = $state('SharedUtilsFixture');
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

  const [value, setValue] = useControlled(() => ({ controlled, default: defaultValue, name }));
  const ref = useRefWithInit((seed: string) => { initialized += 1; return { seed }; }, 'seed');
  const stable = useStableCallback(() => ownerCallback(owner));
  const optional = useStableCallback(undefined);
  const timeout = useTimeout();
  untrack(() => events.push(`parent-setup:${stable()}`));

  useIsoLayoutEffect(() => {
    events.push(`parent-effect:${stable()}`);
    return () => { events.push('parent-cleanup'); };
  }, () => [stable]);

  useIsoLayoutEffect(() => {
    effectRuns += 1;
    void callbackOnlyValue;
    return () => { effectCleanups += 1; };
  }, () => { void unrelated; return [dependency.value]; });

  $effect(() => {
    stableEffectRuns += 1;
    stable();
  });

  useValueChanged(() => changedValue.value, (previous) => {
    changePrevious.push(previous);
    readsInsideCallback.push(changedValue.value);
    if (mutateDuringChange && changedValue.value === 1) changedValue = { value: 2 };
  });

  export const setControlled = (next: unknown) => { controlled = next; };
  export const setDefault = (next: unknown) => { defaultValue = next; };
  export const setName = (next: string) => { name = next; };
  export const setLocal = (next: SetStateAction<unknown>) => { setValue(next); };
  export const setOwner = (next: string) => { owner = next; };
  export const replaceCallback = () => { ownerCallback = (next) => `replacement:${next}`; };
  export const getStable = () => stable;
  export const callOptional = () => optional();
  export const setChanged = (next: number) => { changedValue = { value: next }; };
  export const mutateOnChange = () => { mutateDuringChange = true; };
  export const setDependency = (next: number) => { dependency = { value: next }; };
  export const setUnrelated = (next: number) => { unrelated = next; };
  export const setCallbackRead = (next: number) => { callbackOnlyValue = next; };
  export const start = (delay: number, callback: () => void) => { timeout.start(delay, callback); };
  export const timerStarted = () => timeout.isStarted();
  export const updateRef = (seed: string) => { ref.current = { seed }; };
  export const snapshot = () => ({
    value: value(), initialized, ref: ref.current, effectRuns, effectCleanups,
    stableEffectRuns, changePrevious, readsInsideCallback,
  });
</script>

<output data-value>{String(value())}</output>
<Child {stable} {events} />
