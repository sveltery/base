// Original Base UI 1.8.0 usePreviousValue current/previous/Object.is business (MIT).
// Native derived observation owns the retained pair without render retries.
import { untrack } from 'svelte';
export function usePreviousValue<T>(getValue: () => T): () => T | null {
  let state: { current: T; previous: T | null } = { current: untrack(getValue), previous: null };
  const previous = $derived.by(() => {
    const value = getValue();
    if (!Object.is(value, state.current)) state = { current: value, previous: state.current };
    return state.previous;
  });
  return () => previous;
}
