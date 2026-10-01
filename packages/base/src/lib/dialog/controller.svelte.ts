// Behavior reference: Base UI v1.8.0 DialogStore/popup lifecycle. MIT; see THIRD_PARTY_NOTICES.md.
import { SvelteMap } from 'svelte/reactivity';
import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { ChangeEventDetails, ChangeReason, InteractionType, RootProps, PopupState } from './types.js';
export class DialogController {
  private internalOpen: boolean = $state(false);
  private activeId: string | null = $state(null);
  presence = $state(false);
  get exiting() { return !this.open && this.presence; }
  deferred = $state(false);
  starting = $state(false);
  readonly generatedPopupId: string;
  popupIdSource: (() => string) | undefined = $state.raw(undefined);
  get popupId() { return this.popupIdSource?.() ?? this.generatedPopupId; }
  popup: HTMLElement | null = null;
  backdrop: HTMLElement | null = null;
  internalBackdrop: HTMLElement | null = null;
  triggers = new SvelteMap<string, HTMLElement>();
  labels = new SvelteMap<object, () => string>();
  descriptions = new SvelteMap<object, () => string>();
  children = new SvelteMap<DialogController, true>();
  readonly initialOpen: boolean;
  everMounted = false;
  method: InteractionType = 'mouse';
  closeMethod: InteractionType = 'mouse';
  previousFocus: HTMLElement | null = null;
  retainedTrigger: HTMLElement | null = null;
  constructor(readonly props: () => RootProps, id: string, readonly parent?: DialogController) {
    this.internalOpen = props().defaultOpen ?? false;
    this.activeId = props().defaultTriggerId ?? null;
    this.generatedPopupId = id;
    this.initialOpen = this.open;
    parent?.children.set(this, true);
  }
  get open() { return this.props().open ?? this.internalOpen; }
  get mounted() { return this.open || this.presence || this.deferred; }
  get modal() { return this.props().modal ?? true; }
  get ownerId() { return this.props().triggerId ?? this.activeId; }
  get trigger() { return this.ownerId ? this.triggers.get(this.ownerId) : undefined; }
  get nestedCount(): number { return [...this.children.keys()].reduce((n, child) => n + (child.open ? 1 + child.nestedCount : 0), 0); }
  get state(): PopupState { return { open: this.open, nested: !!this.parent, nestedDialogOpen: this.nestedCount > 0, transitionStatus: this.starting ? 'starting' : this.exiting ? 'ending' : undefined }; }
  get titleId() { return [...this.labels.values()].at(-1)?.(); }
  get descriptionId() { return [...this.descriptions.values()].at(-1)?.(); }
  request(next: boolean, reason: ChangeReason, event?: Event, trigger?: HTMLElement) {
    const details = createChangeEventDetails(reason, event as never, trigger ?? (!next ? this.trigger : undefined), {
      preventUnmountOnClose: () => { this.deferred = true; },
    }) as ChangeEventDetails;
    this.props().onOpenChange?.(next, details);
    if (details.isCanceled) return details;
    this.props().onInternalOpenChange?.(next, details);
    if (next) {
      this.activeId = trigger?.id ?? this.activeId;
      this.retainedTrigger = trigger ?? this.trigger ?? null;
      this.deferred = false;
    } else {
      this.retainedTrigger = this.trigger ?? this.retainedTrigger;
    }
    this.internalOpen = next;
    return details;
  }
  unmount() {
    this.presence = false; this.deferred = false;
    this.activeId = null; this.retainedTrigger = null;
    this.props().onOpenChangeComplete?.(false);
  }
  destroy() { this.parent?.children.delete(this); }
}
