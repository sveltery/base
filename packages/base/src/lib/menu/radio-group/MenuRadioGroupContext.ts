// Original Base UI 1.8.0 context body, native Svelte provider (MIT).
import { getContext, setContext } from 'svelte';
/* eslint-disable @typescript-eslint/no-explicit-any -- Preserve Source radio erased value contract. */
import type { MenuRoot } from '../types.js';

export interface MenuRadioGroupContext {
  value: any;
  setValue: (newValue: any, eventDetails: MenuRoot.ChangeEventDetails) => void;
  disabled: boolean;
}

export const MenuRadioGroupContext = Symbol('MenuRadioGroupContext');
export function provideMenuRadioGroupContext(value: MenuRadioGroupContext) { setContext(MenuRadioGroupContext, value); }

export function useMenuRadioGroupContext() {
  const context = getContext<MenuRadioGroupContext | undefined>(MenuRadioGroupContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: MenuRadioGroupContext is missing. MenuRadioGroup parts must be placed within <Menu.RadioGroup>.',
    );
  }

  return context;
}
