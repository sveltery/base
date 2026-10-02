// Base UI v1.8.0 DirectionProvider API adaptation; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';

export type TextDirection = 'ltr' | 'rtl';

export interface DirectionProviderProps {
  /** The text reading direction. Defaults to ltr, including within another provider. */
  direction?: TextDirection | undefined;
  children?: Snippet | null | undefined;
}
