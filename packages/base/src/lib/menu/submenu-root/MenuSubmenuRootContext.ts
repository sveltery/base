// Original Base UI 1.8.0 context contract, native Svelte provider. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import { MenuStore } from '../store/MenuStore.svelte.js';

export const MenuSubmenuRootContext = Symbol('MenuSubmenuRootContext');
export function provideMenuSubmenuRootContext(value: MenuSubmenuRootContext | undefined) {
  setContext(MenuSubmenuRootContext, value);
}

export interface MenuSubmenuRootContext {
  parentMenu: MenuStore<unknown>;
}

export function useMenuSubmenuRootContext(): MenuSubmenuRootContext | undefined {
  return getContext<MenuSubmenuRootContext | undefined>(MenuSubmenuRootContext) ?? undefined;
}
