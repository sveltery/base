// Original Base UI 1.8.0 NavigationMenuPositionerContext, native context (MIT).
import { getContext, setContext } from 'svelte';
import type { useNavigationMenuAnchorPositioning } from '../utils/useNavigationMenuAnchorPositioning.svelte.js';
export type NavigationMenuPositionerContext = ReturnType<typeof useNavigationMenuAnchorPositioning>;
const POSITIONER = Symbol('NavigationMenuPositionerContext');
export function provideNavigationMenuPositionerContext(context: NavigationMenuPositionerContext) {
  setContext(POSITIONER, context);
}
export function useNavigationMenuPositionerContext(
  optional: true,
): NavigationMenuPositionerContext | undefined;
export function useNavigationMenuPositionerContext(
  optional?: false,
): NavigationMenuPositionerContext;
export function useNavigationMenuPositionerContext(optional = false) {
  const context = getContext<NavigationMenuPositionerContext | undefined>(POSITIONER);
  if (!context && !optional)
    throw new Error(
      'Base UI: NavigationMenuPositionerContext is missing. NavigationMenuPositioner parts must be placed within <NavigationMenu.Positioner>.',
    );
  return context;
}
