// Adapted from mui/base-ui v1.8.0 Separator types; MIT: THIRD_PARTY_NOTICES.md.
import type { ClassValue } from 'svelte/elements';
import type { HTMLAttributes } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
/** State passed to Separator class/style functions and render snippets. */
export interface SeparatorState { orientation: 'horizontal' | 'vertical' }
/** Native Svelte props, snippets, attachments and bindable actual-element refs. */
export type SeparatorProps = Omit<ElementProps<SeparatorState, HTMLAttributes<HTMLDivElement>>, 'class'> & {
  /** The orientation of the separator. @default 'horizontal' */
  orientation?: SeparatorState['orientation'];
  class?: ClassValue | ((state: SeparatorState) => ClassValue);
};
