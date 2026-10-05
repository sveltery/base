// Base UI v1.8.0 six ScrollArea public part types; native Svelte props/snippets. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
export interface ScrollAreaRootState {
  scrolling: boolean;
  hasOverflowX: boolean;
  hasOverflowY: boolean;
  overflowXStart: boolean;
  overflowXEnd: boolean;
  overflowYStart: boolean;
  overflowYEnd: boolean;
  cornerHidden: boolean;
}
export type ScrollAreaViewportState = ScrollAreaRootState;
export type ScrollAreaContentState = ScrollAreaRootState;
export interface ScrollAreaScrollbarState extends ScrollAreaRootState {
  hovering: boolean;
  orientation: 'vertical' | 'horizontal';
}
export interface ScrollAreaThumbState {
  scrolling: boolean;
  orientation: 'horizontal' | 'vertical';
}
export type ScrollAreaCornerState = Record<string, never>;
type PartProps<State> = Omit<WithBaseUIEvent<HTMLAttributes<HTMLDivElement>>, 'class' | 'style' | 'children'> & BaseUIComponentProps<State> & {
  children?: Snippet | undefined;
  ref?: HTMLElement | null | undefined;
};
export type ScrollAreaRootProps = PartProps<ScrollAreaRootState> & {
  overflowEdgeThreshold?: number | Partial<{ xStart: number; xEnd: number; yStart: number; yEnd: number }> | undefined;
};
export type ScrollAreaViewportProps = PartProps<ScrollAreaViewportState>;
export type ScrollAreaContentProps = PartProps<ScrollAreaContentState>;
export type ScrollAreaScrollbarProps = PartProps<ScrollAreaScrollbarState> & {
  orientation?: 'vertical' | 'horizontal' | undefined;
  keepMounted?: boolean | undefined;
};
export type ScrollAreaThumbProps = PartProps<ScrollAreaThumbState>;
export type ScrollAreaCornerProps = PartProps<ScrollAreaCornerState>;
export type HiddenState = { x: boolean; y: boolean; corner: boolean };
export type OverflowEdges = { xStart: boolean; xEnd: boolean; yStart: boolean; yEnd: boolean };
export type Size = { width: number; height: number };
export type Coords = { x: number; y: number };
