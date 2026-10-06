// Source: Base UI v1.8.0 ListboxSeparator.tsx at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../../internals/types.js';

export interface ListboxSeparatorState {
  /** The orientation of the separator. */
  orientation: 'horizontal' | 'vertical';
}

export type ListboxSeparatorProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLDivElement>>,
  'class' | 'style' | 'children' | 'color'
> &
  BaseUIComponentProps<ListboxSeparatorState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    /** The orientation of the separator. @default 'horizontal' */
    orientation?: ListboxSeparatorState['orientation'] | undefined;
  };
