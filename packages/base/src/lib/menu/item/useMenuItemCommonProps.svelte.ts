// Original Menu item-common full business body, native events/live derived props (MIT).
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type -- Retain Original erased item store/empty state contracts. */
import { platform } from '@sveltery/utils/platform';
import type { HTMLProps } from '../../internals/types.js';
import type { MenuStore } from '../store/MenuStore.svelte.js';
import { REASONS } from '../../internals/reasons.js';
import { useContextMenuRootContext } from '../../context-menu/root/ContextMenuRootContext.js';
import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers.js';
import type { UseMenuItemMetadata } from './useMenuItem.svelte.js';
export interface UseMenuItemCommonPropsParameters {
  /**
   * Whether to close the menu when the item is clicked.
   */
  closeOnClick: boolean;
  /**
   * Determines if the menu item is highlighted.
   */
  highlighted: boolean;
  /**
   * The id of the menu item.
   */
  id: string | undefined;
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
   */
  typingRef?: { current: boolean } | undefined;
  /**
   * Ref to the item element.
   */
  itemRef: { current: HTMLElement | null };
  /**
   * Metadata for checking item type before triggering click.
   */
  itemMetadata: UseMenuItemMetadata;
}

/**
 * Returns common props shared by all menu item types.
 * This hook extracts the shared logic for id, role, tabindex, onkeydown,
 * onmousemove, onclick, and onmouseup handlers.
 */
export function useMenuItemCommonProps(getParams: () => UseMenuItemCommonPropsParameters): () => HTMLProps {
  const { closeOnClick, highlighted, id, nodeId, store, typingRef, itemRef, itemMetadata } = $derived(getParams());

  const menuEvents = $derived(store.useState('floatingTreeRoot').events);
  const open = $derived(store.useState('open'));
  const contextMenuContext = useContextMenuRootContext(true);
  const isContextMenu = contextMenuContext !== undefined;

  const commonProps = $derived.by(
    () => ({
      id,
      role: 'menuitem' as const,
      tabindex: open && highlighted ? 0 : -1,
      onkeydown(event: KeyboardEvent) {
        if (event.key === ' ' && typingRef?.current) {
          event.preventDefault();
        }
      },
      onmousemove(event: MouseEvent) {
        if (!nodeId) {
          return;
        }

        // Inform the floating tree that a menu item within this menu was hovered/moved over
        // so unrelated descendant submenus can be closed.
        menuEvents.emit('itemhover', {
          nodeId,
          target: event.currentTarget,
        });
      },
      onclick(event: MouseEvent) {
        if (closeOnClick) {
          menuEvents.emit('close', { domEvent: event, reason: REASONS.itemPress });
        }
      },
      onmouseup(event: MouseEvent) {
        if (contextMenuContext) {
          const initialCursorPoint = contextMenuContext.initialCursorPointRef.current;
          contextMenuContext.initialCursorPointRef.current = null;
          if (
            isContextMenu &&
            initialCursorPoint &&
            Math.abs(event.clientX - initialCursorPoint.x) <= 1 &&
            Math.abs(event.clientY - initialCursorPoint.y) <= 1
          ) {
            return;
          }

          // On non-macOS platforms, this mouseup belongs to the right-click gesture
          // that opened the context menu, so it must not activate an item.
          if (isContextMenu && !platform.os.mac && event.button === 2) {
            return;
          }
        }

        if (
          itemRef.current &&
          store.context.allowMouseUpTriggerRef.current &&
          (!isContextMenu || event.button === 2)
        ) {
          // This fires whenever the user clicks on the trigger, moves the cursor, and releases it over the item.
          // We trigger the click and override the `closeOnClick` preference to always close the menu.
          if (itemMetadata.type === 'regular-item') {
            // `detail: 1` marks this as a mouse-gesture click so MenuRoot doesn't
            // treat it as a keyboard activation (`detail === 0` → `data-instant`).
            dispatchClickWithModifiers(itemRef.current, event, { detail: 1 });
          }
        }
      },
    }),

  );
  return () => commonProps;
}

export interface UseMenuItemCommonPropsState {}
