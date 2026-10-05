// Base UI v1.8.0 Separator public contracts; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
export interface SeparatorState { orientation: 'horizontal' | 'vertical' }
export type SeparatorProps =
  Omit<WithBaseUIEvent<HTMLAttributes<HTMLDivElement>>, 'class' | 'style' | 'children' | 'color'> &
  BaseUIComponentProps<SeparatorState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    orientation?: SeparatorState['orientation'] | undefined;
  };
