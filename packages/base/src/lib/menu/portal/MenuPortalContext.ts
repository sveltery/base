// Original MenuPortal context, native live context (MIT).
import { getContext, setContext } from 'svelte';
const PORTAL = Symbol('MenuPortal');
export function provideMenuPortalContext(getKeepMounted: () => boolean) {
  setContext(PORTAL, getKeepMounted);
}
export function useMenuPortalContext() {
  const value = getContext<(() => boolean) | undefined>(PORTAL);
  if (value === undefined) throw new Error('Base UI: <Menu.Portal> is missing.');
  return value;
}
