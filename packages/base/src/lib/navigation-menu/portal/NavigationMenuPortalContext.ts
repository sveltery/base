// Original Base UI 1.8.0 NavigationMenuPortalContext, native context (MIT).
import { getContext, setContext } from 'svelte';
const PORTAL = Symbol('NavigationMenuPortalContext');
export function provideNavigationMenuPortalContext(getKeepMounted: () => boolean) {
  setContext(PORTAL, getKeepMounted);
}
export function useNavigationMenuPortalContext() {
  const value = getContext<(() => boolean) | undefined>(PORTAL);
  if (value === undefined) throw new Error('Base UI: <NavigationMenu.Portal> is missing.');
  return value;
}
