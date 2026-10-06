// Original Base UI 1.8.0 context body, native Svelte provider (MIT).
import { getContext, setContext } from 'svelte';

export interface MenuRadioItemContext {
  checked: boolean;
  highlighted: boolean;
  disabled: boolean;
}

export const MenuRadioItemContext = Symbol('MenuRadioItemContext');
export function provideMenuRadioItemContext(value: MenuRadioItemContext) {
  setContext(MenuRadioItemContext, value);
}

export function useMenuRadioItemContext() {
  const context = getContext<MenuRadioItemContext | undefined>(MenuRadioItemContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: MenuRadioItemContext is missing. MenuRadioItem parts must be placed within <Menu.RadioItem>.',
    );
  }

  return context;
}
