// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { createContext } from 'svelte';
import type { TextDirection } from './types.js';

interface DirectionContext {
  readonly direction: TextDirection;
}

const [get, set, has] = createContext<DirectionContext>();
export const setDirectionContext = set;

/**
 * Call during component initialization, then retain and call the returned getter
 * in markup or $derived to react to the nearest provider's direction updates.
 * Outside a provider, the getter returns ltr.
 */
export function useDirection(): () => TextDirection {
  const context = has() ? get() : undefined;
  return () => context?.direction ?? 'ltr';
}
