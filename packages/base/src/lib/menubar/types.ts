// Original Base UI 1.8.0 menubar public type contracts; MIT: THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace -- Original erased namespace and empty State contracts. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ElementProps, MenuRoot, MenuPositionerState, MenuPositionerProps } from '../menu/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';



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