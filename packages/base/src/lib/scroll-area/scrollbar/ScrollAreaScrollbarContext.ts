// Base UI v1.8.0 ScrollAreaScrollbarContext; native nearest reactive orientation. MIT.
import { createContext } from 'svelte';
export type ScrollAreaScrollbarContext = () => 'horizontal' | 'vertical';
const [get, set, has] = createContext<ScrollAreaScrollbarContext>();
export const setScrollAreaScrollbarContext = set;
export function useScrollAreaScrollbarContext() {
  if (!has())
    throw new Error(
      'Base UI: ScrollAreaScrollbarContext is missing. ScrollAreaScrollbar parts must be placed within <ScrollArea.Scrollbar>.',
    );
  return get();
}
