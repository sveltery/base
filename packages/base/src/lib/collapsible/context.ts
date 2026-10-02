import { getContext, setContext } from 'svelte';
import type { CollapsibleRootChangeEventDetails, CollapsibleRootState, CollapsibleTransitionStatus } from './types.js';
export interface CollapsibleContext {
  readonly open: boolean;
  readonly disabled: boolean;
  readonly mounted: boolean;
  readonly transitionStatus: CollapsibleTransitionStatus;
  readonly defaultPanelId: string;
  readonly registeredPanelId: string | null | undefined;
  readonly panelId: string | undefined;
  readonly state: CollapsibleRootState;
  setMounted(next: boolean): void;
  setOpen(next: boolean): void;
  onOpenChange(next: boolean, details: CollapsibleRootChangeEventDetails): void;
  handleTrigger(event: MouseEvent | KeyboardEvent): void;
  setPanelIdState(next: string | null | undefined | ((current: string | null | undefined) => string | null | undefined)): void;
}
const key = Symbol('Collapsible.Root');
export function setCollapsibleContext(value: CollapsibleContext) { setContext(key, value); }
export function getCollapsibleContext(): CollapsibleContext {
  const value = getContext<CollapsibleContext | undefined>(key);
  if (!value) throw new Error('Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.');
  return value;
}
