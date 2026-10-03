// Original FloatingPortal context shape, using native Svelte context (MIT).
import { getContext } from 'svelte';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
export type FocusManagerState = null | {
  modal: boolean; open: boolean; closeOnFocusOut: boolean; domReference: Element | null;
  onOpenChange(open: boolean, details: BaseUIChangeEventDetails<string>): void;
};
export interface FloatingPortalContext {
  readonly portalNode: HTMLElement | null;
  setFocusManagerState(state: FocusManagerState): void;
  beforeInsideRef: { current: HTMLSpanElement | null }; afterInsideRef: { current: HTMLSpanElement | null };
  beforeOutsideRef: { current: HTMLSpanElement | null }; afterOutsideRef: { current: HTMLSpanElement | null };
}
export const PORTAL = Symbol('FloatingPortal');
export function usePortalContext() { return getContext<FloatingPortalContext | undefined>(PORTAL) ?? null; }
