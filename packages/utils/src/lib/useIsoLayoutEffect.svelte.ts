// Adapted from Base UI v1.8.0 packages/utils/src/useIsoLayoutEffect.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';

type EffectCallback = () => void | (() => void);

/** Client post-DOM synchronization, initialized during component setup. */
export function useIsoLayoutEffect(
  effect: EffectCallback,
  getDependencies?: () => readonly unknown[],
) {
  if (getDependencies === undefined) {
    $effect(effect);
    return;
  }

  // React tracks its declared dependency list rather than reads in the setup.
  // Retaining an equal tuple also prevents cleanup for unrelated native reads.
  let previousDependencies: readonly unknown[] | undefined;
  const dependencies = $derived.by(() => {
    const nextDependencies = getDependencies();
    if (
      previousDependencies !== undefined &&
      previousDependencies.length === nextDependencies.length &&
      nextDependencies.every((value, index) => Object.is(value, previousDependencies![index]))
    ) {
      return previousDependencies;
    }
    previousDependencies = nextDependencies;
    return nextDependencies;
  });

  $effect(() => {
    void dependencies;
    return untrack(effect);
  });
}
