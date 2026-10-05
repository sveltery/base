// Original Base UI 1.8.0 context contract, native Svelte provider. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { ContextMenuRoot } from '../types.js';

export interface ContextMenuRootContext {
  anchor: { getBoundingClientRect: () => DOMRect };
  setAnchor: (anchor: ContextMenuRootContext['anchor']) => void;
  backdropRef: { current: HTMLDivElement | null };
  internalBackdropRef: { current: HTMLDivElement | null };
  actionsRef: { current: {
    setOpen: (nextOpen: boolean, eventDetails: ContextMenuRoot.ChangeEventDetails) => void;
  } | null };
  positionerRef: { current: HTMLElement | null };
  allowMouseUpTriggerRef: { current: boolean };
  initialCursorPointRef: { current: { x: number; y: number } | null };
  rootId: string | undefined;
}

export const ContextMenuRootContext = Symbol('ContextMenuRootContext');
export function provideContextMenuRootContext(value: ContextMenuRootContext | undefined) { setContext(ContextMenuRootContext, value); }

export function useContextMenuRootContext(optional: false): ContextMenuRootContext;
export function useContextMenuRootContext(optional?: true): ContextMenuRootContext | undefined;
export function useContextMenuRootContext(optional = true) {
  const context = (getContext<ContextMenuRootContext | undefined>(ContextMenuRootContext) ?? undefined);
  if (context === undefined && !optional) {
    throw new Error(
      'Base UI: ContextMenuRootContext is missing. ContextMenu parts must be placed within <ContextMenu.Root>.',
    );
  }
  return context;
}
