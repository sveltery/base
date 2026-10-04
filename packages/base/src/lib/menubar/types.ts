// Original Base UI 1.8.0 menubar public type contracts; MIT: THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-namespace -- Original erased namespace and empty State contracts. */
import type { HTMLAttributes } from 'svelte/elements';
import type { ElementProps, MenuRoot } from '../menu/types.js';



export interface MenubarState {
  /**
   * The orientation of the menubar.
   */
  orientation: MenuRoot.Orientation;
  /**
   * Whether the menubar is modal.
   */
  modal: boolean;
  /**
   * Whether any submenu within the menubar is open.
   */
  hasSubmenuOpen: boolean;
}


export interface MenubarProps extends ElementProps<MenubarState, HTMLAttributes<HTMLDivElement>> {
  /**
   * Whether the menubar is modal.
   * @default true
   */
  modal?: boolean | undefined;
  /**
   * Whether the whole menubar is disabled.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * The orientation of the menubar.
   * @default 'horizontal'
   */
  orientation?: MenuRoot.Orientation | undefined;
  /**
   * Whether to loop keyboard focus back to the first item
   * when the end of the list is reached while using the arrow keys.
   * @default true
   */
  loopFocus?: boolean | undefined;
}


export namespace Menubar {
  export type State = MenubarState;
  export type Props = MenubarProps;
}