// Derived from Base UI CSPContext at 47b40521; MIT: ../../../THIRD_PARTY_NOTICES.md.
import { createContext } from 'svelte';
export interface CSPContextValue {
  readonly nonce?: string | undefined;
  readonly disableStyleElements?: boolean | undefined;
}
const [getContext, setCSPContext, hasContext] = createContext<CSPContextValue>();
export { setCSPContext };
const DEFAULT_CSP_CONTEXT_VALUE: CSPContextValue = { disableStyleElements: false };
/** Internal consumer contract. A Provider's omitted props do not inherit from its parent. */
export function getCSPContext(): CSPContextValue {
  return hasContext() ? getContext() : DEFAULT_CSP_CONTEXT_VALUE;
}
