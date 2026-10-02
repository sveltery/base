// Base UI v1.8.0 popupTriggerMap/useTriggerRegistration/useTriggerDataForwarding. MIT.
// Immutable reference: 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; see THIRD_PARTY_NOTICES.md.
import { SvelteMap } from 'svelte/reactivity';
import { DEV } from 'esm-env';
import type { ChangeEventDetails, ChangeReason, InteractionType } from './types.js';

export class TriggerMap extends SvelteMap<string, HTMLElement> {
  private readonly elementIds = new WeakMap<HTMLElement, string>();
  override set(id: string, element: HTMLElement) {
    if (DEV) {
      const existingId = this.elementIds.get(element);
      if (existingId !== undefined && existingId !== id) throw new Error('Base UI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap.');
      const previous = super.get(id);
      if (previous && previous !== element) this.elementIds.delete(previous);
      this.elementIds.set(element, id);
    }
    return super.set(id, element);
  }
  override delete(id: string) {
    const element = super.get(id);
    if (element) this.elementIds.delete(element);
    return super.delete(id);
  }
}

/** The live Root and closed fallback expose the same trigger-facing surface. */
export interface TriggerStore {
  readonly open: boolean;
  readonly mounted: boolean;
  readonly ownerId: string | null;
  readonly popupId: string | undefined;
  readonly triggers: TriggerMap;
  method: InteractionType;
  closeMethod: InteractionType;
  programmaticOpen: boolean;
  request(next: boolean, reason: ChangeReason, event?: Event, trigger?: HTMLElement): ChangeEventDetails | undefined;
  forwardTrigger(id: string, element: HTMLElement, payload: unknown, registering: boolean): void;
}

export function createFallbackStore(): TriggerStore {
  // The registry is mutable, but detached requests/data writes never mutate popup state.
  return {
    open: false, mounted: false, ownerId: null, popupId: undefined,
    triggers: new TriggerMap(), method: 'mouse', closeMethod: 'mouse', programmaticOpen: true,
    request() { return undefined; }, forwardTrigger() {},
  };
}
