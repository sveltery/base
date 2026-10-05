// Original Base UI 1.8.0 NavigationMenuDismissContext, native context (MIT).
import { getContext, setContext } from 'svelte';
import type { ElementProps } from '../../floating-ui/types.js';
const DISMISS = Symbol('NavigationMenuDismissContext');
export function provideNavigationMenuDismissContext(getProps: () => ElementProps | undefined) {
  setContext(DISMISS, getProps);
}
export function useNavigationMenuDismissContext() {
  return getContext<(() => ElementProps | undefined) | undefined>(DISMISS);
}
