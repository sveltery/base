// Original Base UI 1.8.0 context body, native Svelte provider (MIT).
import { getContext, setContext } from 'svelte';
/* eslint-disable @typescript-eslint/no-explicit-any -- Preserve Source radio erased value contract. */

export interface MenuCheckboxItemContext {
  checked: boolean;
  highlighted: boolean;
  disabled: boolean;
}

export const MenuCheckboxItemContext = Symbol('MenuCheckboxItemContext');
export function provideMenuCheckboxItemContext(value: MenuCheckboxItemContext) { setContext(MenuCheckboxItemContext, value); }

export function useMenuCheckboxItemContext() {
  const context = getContext<MenuCheckboxItemContext | undefined>(MenuCheckboxItemContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: MenuCheckboxItemContext is missing. MenuCheckboxItem parts must be placed within <Menu.CheckboxItem>.',
    );
  }

  return context;
}
