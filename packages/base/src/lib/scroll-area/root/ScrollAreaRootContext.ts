// Base UI v1.8.0 ScrollAreaRootContext; native required Svelte context. MIT.
import { createContext } from 'svelte';
import type { Coords, HiddenState, OverflowEdges, ScrollAreaRootState, Size } from '../types.js';
type SetState<T> = (value: T | ((previous: T) => T)) => void;
type ElementRef = { current: HTMLElement | null };
export interface ScrollAreaRootContext {
  readonly cornerSize: Size;
  setCornerSize: SetState<Size>;
  readonly thumbSize: Size;
  setThumbSize: SetState<Size>;
  readonly hasMeasuredScrollbar: boolean;
  setHasMeasuredScrollbar: SetState<boolean>;
  readonly touchModality: boolean;
  readonly hovering: boolean;
  setHovering: SetState<boolean>;
  readonly scrollingX: boolean;
  readonly scrollingY: boolean;
  viewportRef: ElementRef;
  scrollbarYRef: ElementRef;
  scrollbarXRef: ElementRef;
  thumbYRef: ElementRef;
  thumbXRef: ElementRef;
  cornerRef: ElementRef;
  handlePointerDown: (event: PointerEvent) => void;
  handlePointerMove: (event: PointerEvent) => void;
  handlePointerUp: (event: PointerEvent) => void;
  handleScroll: (position: Coords) => void;
  disableViewportSnap: () => void;
  readonly rootId: string;
  readonly hiddenState: HiddenState;
  setHiddenState: SetState<HiddenState>;
  readonly overflowEdges: OverflowEdges;
  setOverflowEdges: SetState<OverflowEdges>;
  readonly viewportState: ScrollAreaRootState;
  readonly overflowEdgeThreshold: OverflowEdgesThreshold;
}
export type OverflowEdgesThreshold = { xStart: number; xEnd: number; yStart: number; yEnd: number };
const [get, set, has] = createContext<ScrollAreaRootContext>();
export const setScrollAreaRootContext = set;
export function useScrollAreaRootContext() {
  if (!has())
    throw new Error(
      'Base UI: ScrollAreaRootContext is missing. ScrollArea parts must be placed within <ScrollArea.Root>.',
    );
  return get();
}
