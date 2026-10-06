// Original Base UI 1.8.0 context contract, native Svelte provider. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import { type MenuRoot } from '../menu/types.js';

export interface MenubarContext {
  modal: boolean;
  disabled: boolean;
  contentElement: HTMLElement | null;
  setContentElement: (element: HTMLElement | null) => void;
  hasSubmenuOpen: boolean;
  setHasSubmenuOpen: (open: boolean) => void;
  orientation: MenuRoot.Orientation;
  allowMouseUpTriggerRef: { current: boolean };
  rootId: string | undefined;
}

export const MenubarContext = Symbol('MenubarContext');
export function provideMenubarContext(value: MenubarContext | null) {
  setContext(MenubarContext, value);
}

export function useMenubarContext(optional?: false): MenubarContext;
export function useMenubarContext(optional: true): MenubarContext | null;
export function useMenubarContext(optional?: boolean) {
  const context = getContext<MenubarContext | null>(MenubarContext) ?? null;
  if (context === null && !optional) {
    throw new Error(
      'Base UI: MenubarContext is missing. Menubar parts must be placed within <Menubar>.',
    );
  }

  return context;
}
