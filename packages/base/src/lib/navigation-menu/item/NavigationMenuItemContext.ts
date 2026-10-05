// Original Base UI 1.8.0 NavigationMenuItemContext, native Svelte context (MIT).
import { getContext, setContext } from 'svelte';
export interface NavigationMenuItemContextValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Original Item permits arbitrary values.
  readonly value: any;
}
const ITEM = Symbol('NavigationMenuItemContext');
export function provideNavigationMenuItemContext(context: NavigationMenuItemContextValue) {
  setContext(ITEM, context);
}
export function useNavigationMenuItemContext() {
  const value = getContext<NavigationMenuItemContextValue | undefined>(ITEM);
  if (!value)
    throw new Error(
      'Base UI: NavigationMenuItem parts must be used within a <NavigationMenu.Item>.',
    );
  return value;
}
