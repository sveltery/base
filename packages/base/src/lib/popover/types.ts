// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { PopoverHandle } from './store/PopoverHandle.svelte.js';
export type PopoverRootState = Record<string, never>;
export type PopoverRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'close-press' | 'focus-out' | 'imperative-action' | 'none';
export type PopoverRootChangeEventDetails = BaseUIChangeEventDetails<PopoverRootChangeEventReason, { preventUnmountOnClose(): void }>;
export interface PopoverRootActions { unmount(): void; close(): void }
export interface PopoverRootProps<Payload = unknown> {
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: PopoverRootChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  actions?: PopoverRootActions | null | undefined;
  handle?: PopoverHandle<Payload> | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
  children?: Snippet<[{ payload: Payload | undefined }]> | undefined;
  modal?: boolean | 'trap-focus' | undefined;
}
