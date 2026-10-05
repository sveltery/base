// Original Base UI 1.8.0 context contract, native Svelte provider. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import { type MenuStore } from '../store/MenuStore.svelte.js';
import type { MenuParent } from '../types.js';

export interface MenuRootContext<Payload = unknown> {
  store: MenuStore<Payload>;
  parent: MenuParent;
}

export const MenuRootContext = Symbol('MenuRootContext');
export function provideMenuRootContext(value: MenuRootContext | undefined) { setContext(MenuRootContext, value); }

export function useMenuRootContext(optional?: false): MenuRootContext;
export function useMenuRootContext(optional: true): MenuRootContext | undefined;
export function useMenuRootContext(optional?: boolean) {
  const context = (getContext<MenuRootContext | undefined>(MenuRootContext) ?? undefined);
  if (context === undefined && !optional) {
    throw new Error(
      'Base UI: MenuRootContext is missing. Menu parts must be placed within <Menu.Root>.',
    );
  }

  return context;
}
