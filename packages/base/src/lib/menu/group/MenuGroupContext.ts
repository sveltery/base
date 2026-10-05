// Original MenuGroupContext, native setter/context boundary (MIT).
import { getContext, setContext } from 'svelte';
import type { SetStateAction } from '@sveltery/utils/useControlled';

export type MenuGroupContext = (value: SetStateAction<string | undefined>) => void;

export const MenuGroupContext = Symbol('MenuGroup');

export function useMenuGroupRootContext() {
  const context = getContext<MenuGroupContext | undefined>(MenuGroupContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: MenuGroupContext is missing. Menu group parts must be used within <Menu.Group> or <Menu.RadioGroup>.',
    );
  }

  return context;
}

export function provideMenuGroupContext(value: MenuGroupContext) { setContext(MenuGroupContext, value); }
