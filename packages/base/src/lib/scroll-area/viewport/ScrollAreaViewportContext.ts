// Base UI v1.8.0 ScrollAreaViewportContext; native required context. MIT.
import { createContext } from 'svelte';
export interface ScrollAreaViewportContext { computeThumbPosition: () => void }
const [get, set, has] = createContext<ScrollAreaViewportContext>();
export const setScrollAreaViewportContext = set;
export function useScrollAreaViewportContext() {
  if (!has()) throw new Error('Base UI: ScrollAreaViewportContext missing. ScrollAreaViewport parts must be placed within <ScrollArea.Viewport>.');
  return get();
}
