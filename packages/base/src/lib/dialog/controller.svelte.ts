// Behavior reference: Base UI v1.8.0 DialogStore/popup lifecycle. MIT; see THIRD_PARTY_NOTICES.md.
import { SvelteMap } from 'svelte/reactivity';
import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import { TriggerMap } from './trigger-store.svelte.js';
import type { ChangeEventDetails, ChangeReason, InteractionType, RootProps, PopupState } from './types.js';
export class DialogController {
  private internalOpen: boolean = $state(false);
  private activeId: string | null = $state(null);
  private activeElement: HTMLElement | null = $state.raw(null);
  payload: unknown = $state.raw(undefined);
  presence = $state(false);
  get exiting() { return !this.open && this.presence; }
  deferred = $state(false);
  completionVersion = 0;
  starting = $state(false);
  readonly generatedPopupId: string;
  popupIdSource: (() => string) | undefined = $state.raw(undefined);
  get popupId() { return this.popupIdSource?.() ?? this.generatedPopupId; }
  popup: HTMLElement | null = $state.raw(null);
  backdrop: HTMLElement | null = null;
  internalBackdrop: HTMLElement | null = null;
  triggers = new TriggerMap();
  labels = new SvelteMap<object, () => string>();
  descriptions = new SvelteMap<object, () => string>();
  children = new SvelteMap<DialogController, true>();
  readonly initialOpen: boolean;
  everMounted = false;
  method: InteractionType = 'mouse';
  closeMethod: InteractionType = 'mouse';
  programmaticOpen = true;
  private destroyed = false;
  previousFocus: HTMLElement | null = null;
  retainedTrigger: HTMLElement | null = null;
  constructor(readonly props: () => Omit<RootProps, 'children' | 'handle'>, id: string, readonly parent?: DialogController) {
    this.internalOpen = props().defaultOpen ?? false;
    this.activeId = props().defaultTriggerId ?? null;
    this.generatedPopupId = id;
    this.initialOpen = this.open;
    this.presence = this.initialOpen;
    this.previousSyncedOpen = this.initialOpen;
    parent?.children.set(this, true);
  }
  get open() { return this.props().open ?? this.internalOpen; }
  get mounted() { return this.presence || this.deferred; }
  get modal() { return this.props().modal ?? true; }
  get ownerId() { return this.props().triggerId ?? this.activeId; }
  get trigger() { return this.mounted ? this.activeElement ?? (this.ownerId ? this.triggers.get(this.ownerId) : undefined) : undefined; }
  private previousSyncedOpen: boolean;
  synchronizeOpen(open: boolean) {
    if (open === this.previousSyncedOpen) return;
    this.previousSyncedOpen = open;
    if (open) this.presence = true;
    else this.programmaticOpen = true;
  }
  synchronizeCompletion() {
    // Completion belongs to the Root even if the Popup is absent or removed during close.
    if (this.open || !this.mounted || this.deferred || this.popup) return;
    const version = this.completionVersion;
    queueMicrotask(() => {
      if (!this.destroyed && !this.open && this.mounted && !this.deferred && !this.popup && version === this.completionVersion) this.unmount();
    });
  }
  reconcileTrigger() {
    if (!this.open) return;
    const owner = this.ownerId;
    if (owner) {
      const element = this.triggers.get(owner);
      if (element) this.activeElement = element;
      else if (this.activeElement) {
        for (const [id, trigger] of this.triggers) if (trigger === this.activeElement) { this.activeId = id; break; }
      }
    } else if (this.triggers.size === 1) {
      const [id, element] = this.triggers.entries().next().value!;
      this.activeId = id; this.activeElement = element;
    }
  }
  forwardTrigger(id: string, element: HTMLElement, payload: unknown, registering: boolean) {
    if (this.ownerId === id) {
      this.activeElement = element;
      if (this.open || (!registering && this.mounted)) this.payload = payload;
    } else if (registering && this.open && this.ownerId == null) {
      this.activeId = id; this.activeElement = element; this.payload = payload;
    }
  }
  get nestedCount(): number { return [...this.children.keys()].reduce((n, child) => n + (child.open ? 1 + child.nestedCount : 0), 0); }
  get state(): PopupState { return { open: this.open, nested: !!this.parent, nestedDialogOpen: this.nestedCount > 0, transitionStatus: this.starting ? 'starting' : this.exiting ? 'ending' : undefined }; }
  get titleId() { return [...this.labels.values()].at(-1)?.(); }
  get descriptionId() { return [...this.descriptions.values()].at(-1)?.(); }
  request(next: boolean, reason: ChangeReason, event?: Event, trigger?: HTMLElement) {
    // Keep the decision local until callbacks accept this request. Retained details
    // cannot change a later request's lifecycle, and canceled requests commit nothing.
    let deferUnmount = false;
    // The pin checks internal activeTriggerId here, not the controlled selected ID.
    const details = createChangeEventDetails(reason, event as never, trigger ?? (!next && this.activeId != null ? this.activeElement ?? undefined : undefined), {
      preventUnmountOnClose: () => { deferUnmount = true; },
    }) as ChangeEventDetails;
    this.props().onOpenChange?.(next, details);
    if (details.isCanceled) return details;
    this.props().onInternalOpenChange?.(next, details);
    this.deferred = !next && deferUnmount;
    if (next) {
      this.activeId = trigger?.id ?? null;
      this.activeElement = trigger ?? null;
      this.retainedTrigger = trigger ?? this.trigger ?? null;
    } else {
      this.retainedTrigger = this.trigger ?? this.retainedTrigger;
    }
    this.internalOpen = next;
    if (this.open) this.presence = true;
    return details;
  }
  unmount() {
    this.completionVersion++;
    this.presence = false; this.deferred = false;
    this.activeId = null; this.activeElement = null; this.retainedTrigger = null;
    this.props().onOpenChangeComplete?.(false);
    // The pin's independent transition mounted state immediately remounts while logical open remains true.
    if (this.open) queueMicrotask(() => { if (!this.destroyed && this.open) this.presence = true; });
  }
  beginOpenCycle() { this.deferred = false; this.completionVersion++; }
  destroy() { this.destroyed = true; this.completionVersion++; this.parent?.children.delete(this); }
}
