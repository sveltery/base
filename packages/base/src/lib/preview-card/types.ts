// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { PreviewCardHandle } from './store/PreviewCardHandle.svelte.js';
export type PreviewCardRootState = Record<string, never>;
export type PreviewCardRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'imperative-action' | 'none';
export type PreviewCardRootChangeEventDetails = BaseUIChangeEventDetails<PreviewCardRootChangeEventReason, { preventUnmountOnClose(): void }>;
export interface PreviewCardRootActions { unmount(): void; close(): void }
export interface PreviewCardRootProps<Payload = unknown> {
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: PreviewCardRootChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  actions?: PreviewCardRootActions | null | undefined;
  handle?: PreviewCardHandle<Payload> | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
  children?: Snippet<[{ payload: Payload | undefined }]> | undefined;
}
