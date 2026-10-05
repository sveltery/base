// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { TooltipHandle } from './store/TooltipHandle.svelte.js';
export type TooltipRootState = Record<string, never>;
export type TooltipRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'focus-out' | 'disabled' | 'imperative-action' | 'none';
export type TooltipRootChangeEventDetails = BaseUIChangeEventDetails<TooltipRootChangeEventReason, { preventUnmountOnClose(): void }>;
export interface TooltipRootActions { unmount(): void; close(): void }
export interface TooltipRootProps<Payload = unknown> {
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: TooltipRootChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  actions?: TooltipRootActions | null | undefined;
  handle?: TooltipHandle<Payload> | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
  children?: Snippet<[{ payload: Payload | undefined }]> | undefined;
  disabled?: boolean | undefined;
  disableHoverablePopup?: boolean | undefined;
  trackCursorAxis?: 'none' | 'x' | 'y' | 'both' | undefined;
}
export type TooltipProviderState = Record<string, never>;
export interface TooltipProviderProps {
  children?: Snippet | undefined;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  timeout?: number | undefined;
}
