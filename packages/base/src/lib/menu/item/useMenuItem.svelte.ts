// Original useMenuItem full business body, native button/ref composition (MIT).
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type -- Retain Original erased store/empty state contracts. */
import { createMergedRefs } from '@sveltery/utils/useMergedRefs';
import { useButton } from '../../internals/use-button/useButton.svelte.js';
import { mergeProps } from '../../merge-props/index.js';
import type { HTMLProps } from '../../internals/types.js';
import type { MenuStore } from '../store/MenuStore.svelte.js';
import { useMenuItemCommonProps } from './useMenuItemCommonProps.svelte.js';
export const REGULAR_ITEM = {
  type: 'regular-item' as const,
};
export function useMenuItem(getParams: () => UseMenuItemParameters): UseMenuItemReturnValue {
  const {
    closeOnClick,
    disabled,
    highlighted,
    id,
    store,
    typingRef: typingRefProp,
    nativeButton,
    itemMetadata,
    nodeId,
  } = $derived(getParams());
  const typingRef = $derived(typingRefProp ?? store.context.typingRef);
  const itemRef = { current: null as HTMLElement | null };
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
    composite: true,
  }));
  const commonProps = useMenuItemCommonProps(() => ({
    closeOnClick,
    highlighted,
    id,
    nodeId,
    store,
    typingRef,
    itemRef,
    itemMetadata,
  }));
  const getItemProps = (externalProps?: HTMLProps): HTMLProps => {
    return mergeProps(
      commonProps(),
      {
        onmouseenter() {
          if (itemMetadata.type !== 'submenu-trigger') {
            return;
          }
          itemMetadata.setActive();
        },
      },
      externalProps,
      getButtonProps,
    );
  };
  const merger = createMergedRefs<HTMLElement>();
  const mergedRef = merger.useMergedRefs(itemRef, buttonRef);
  return { getItemProps, itemRef: mergedRef };
}
export interface UseMenuItemParameters {
  /**
   * Whether to close the menu when the item is clicked.
   */
  closeOnClick: boolean;
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Determines if the menu item is highlighted.
   */
  highlighted: boolean;
  /**
   * The id of the menu item.
   */
  id: string | undefined;
  /**
   * Whether the component renders a native `<button>` element when replacing it
   * via the `render` prop.
   * Set to `false` if the rendered element is not a button (for example, `<div>`).
   * @default false
   */
  nativeButton: boolean;
  /**
   * Additional data specific to the item type.
   */
  itemMetadata: UseMenuItemMetadata;
  /**
   * The node id of the menu positioner.
   */
  nodeId: string | undefined;
  /**
   * The menu store.
   */
  store: MenuStore<any>;
  /**
   * Whether a typeahead session is in progress.
   * @default store.context.typingRef
   */
  typingRef?:
    | {
        current: boolean;
      }
    | undefined;
}
export type UseMenuItemMetadata =
  | typeof REGULAR_ITEM
  | {
      type: 'submenu-trigger';
      setActive: () => void;
    };
export interface UseMenuItemReturnValue {
  /**
   * Resolver for the root slot's props.
   * @param externalProps event handlers for the root slot
   * @returns props that should be spread on the root slot
   */
  getItemProps: (externalProps?: HTMLProps) => HTMLProps;
  /**
   * The ref to the component's root DOM element.
   */
  itemRef: ((node: HTMLElement | null) => void) | null;
}
export interface UseMenuItemState {}
