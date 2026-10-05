// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { TooltipStore, createNullTooltipStore, type TooltipHandleStore } from './TooltipStore.svelte.js';
import { BasePopupHandle } from '../../utils/popups/popupHandle.svelte.js';

/**
 * Controls a Tooltip imperatively and associates detached `Tooltip.Trigger` components with a
 * `Tooltip.Root`. Create one with `Tooltip.createHandle()` and pass it to the `handle` prop of the
 * root and of any triggers rendered outside of it.
 *
 * The imperative methods take effect only while a root using this handle is mounted; calls made
 * before a root attaches (or after it unmounts) are ignored.
 */
export class TooltipHandle<Payload> extends BasePopupHandle<
  TooltipHandleStore<Payload>,
  TooltipStore<Payload>
> {
  constructor() {
    super(createNullTooltipStore<Payload>(), 'Tooltip');
  }

  /**
   * Opens the tooltip and associates it with the trigger with the given id.
   *
   * This method should only be called in an event handler or an effect (not during rendering).
   *
   * @param triggerId ID of the trigger to associate with the tooltip. The trigger must be a matching
   * `Tooltip.Trigger` with this handle passed as a prop.
   */
  open(triggerId: string) {
    this.openByTrigger(triggerId);
  }

  /**
   * Closes the tooltip.
   *
   * This method should only be called in an event handler or an effect (not during rendering).
   */
  close() {
    this.closePopup();
  }

  /**
   * Whether the tooltip is currently open. Returns `false` while no root is attached to the handle.
   */
  get isOpen() {
    return this.attachedStore?.select('open') ?? false;
  }
}

/**
 * Creates a new handle to connect a Tooltip.Root with detached Tooltip.Trigger components.
 */
export function createTooltipHandle<Payload>(): TooltipHandle<Payload> {
  return new TooltipHandle<Payload>();
}
