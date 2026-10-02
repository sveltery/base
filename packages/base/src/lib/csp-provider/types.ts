// Derived from Base UI 47b40521; MIT: ../../../THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';

export interface CSPProviderProps {
  children?: Snippet | undefined;
  /** Nonce for inline style and script elements rendered by supported descendants. */
  nonce?: string | undefined;
  /** Suppress inline style elements in supported descendants. Does not affect scripts. */
  disableStyleElements?: boolean | undefined;
}
// Retain the upstream empty-interface assignability, rather than a never-valued record.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CSPProviderState {}
