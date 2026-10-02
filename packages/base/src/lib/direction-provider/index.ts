import Provider from './DirectionProvider.svelte';
import type { DirectionProviderProps } from './types.js';

export const DirectionProvider = Provider;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned type-only component namespace aliases without a runtime state API.
export namespace DirectionProvider {
  export type Props = DirectionProviderProps;
  export type State = Record<never, never>;
}
export { useDirection } from './context.js';
export type { DirectionProviderProps, TextDirection } from './types.js';
