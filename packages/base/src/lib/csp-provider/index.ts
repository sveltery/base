import Provider from './CSPProvider.svelte';
import type { CSPProviderProps, CSPProviderState } from './types.js';

export const CSPProvider = Provider;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned type-only component namespace aliases without a runtime state API.
export namespace CSPProvider {
  export type Props = CSPProviderProps;
  export type State = CSPProviderState;
}
export type { CSPProviderProps, CSPProviderState } from './types.js';
