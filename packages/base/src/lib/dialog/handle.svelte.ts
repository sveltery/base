// Base UI v1.8.0 DialogHandle/BasePopupHandle. MIT; see THIRD_PARTY_NOTICES.md.
// Immutable reference: 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { DEV } from 'esm-env';
import { SvelteSet } from 'svelte/reactivity';
import type { DialogController } from './controller.svelte.js';
import { createFallbackStore, type TriggerStore } from './trigger-store.svelte.js';

function development() {
  // Keep the pinned runtime NODE_ENV guard usable by the production-mode Node assertion.
  return DEV && (typeof process === 'undefined' || process.env.NODE_ENV !== 'production');
}

/** Connects detached triggers to the most recently committed Root using this handle. */
export class DialogHandle<Payload = unknown> {
  declare private readonly payloadType: (value: Payload) => Payload;
  private readonly fallback = createFallbackStore();
  private readonly attached: DialogController[] = [];
  private current = $state.raw<DialogController | null>(null);
  private readonly listeners = new SvelteSet<() => void>();
  private warningFrame: number | undefined;
  private warningWindow: Window | undefined;

  /** @internal Live trigger store. Server rendering always uses serverStore instead. */
  get store(): TriggerStore { return this.current ?? this.fallback; }
  /** @internal Stable, inert snapshot shared by server rendering and initial hydration. */
  get serverStore(): TriggerStore { return this.fallback; }
  /** @internal */
  subscribeStore(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  /** @internal Attach only from committed component lifecycle. */
  attachStore(controller: DialogController) {
    this.attached.push(controller);
    this.setCurrent(controller);
    if (development() && this.attached.length > 1) {
      const window = controller.popup?.ownerDocument.defaultView ?? globalThis.window;
      if (window) {
        if (this.warningFrame !== undefined) this.warningWindow?.cancelAnimationFrame(this.warningFrame);
        this.warningWindow = window;
        this.warningFrame = window.requestAnimationFrame(() => {
          this.warningFrame = undefined;
          if (this.attached.length > 1) console.warn('Base UI: A handle is attached to more than one mounted root at the same time. The most recently mounted root takes over and the previous one stops being controlled by the handle. A handle should be used by a single root that stays mounted for the lifetime of the handle.');
        });
      }
    }
    return () => {
      const index = this.attached.lastIndexOf(controller);
      if (index !== -1) this.attached.splice(index, 1);
      this.setCurrent(this.attached.at(-1) ?? null);
    };
  }
  private setCurrent(controller: DialogController | null) {
    if (this.current === controller) return;
    this.current = controller;
    this.listeners.forEach(listener => listener());
  }
  private detached(method: 'open' | 'openWithPayload' | 'close') {
    if (development()) console.warn(`Base UI: DialogHandle.${method}() was called while no root using this handle is mounted. ${method === 'openWithPayload' ? 'The call and its payload were ignored; mount a root with this handle before opening it imperatively.' : method === 'open' ? 'The call was ignored; mount a root with this handle before opening it imperatively.' : 'The call was ignored.'}`);
  }
  open(triggerId: string | null) {
    const controller = this.current;
    if (!controller) { this.detached('open'); return; }
    let trigger: HTMLElement | undefined;
    if (triggerId) {
      for (let i = this.attached.length - 1; i >= 0 && !trigger; i--) trigger = this.attached[i].triggers.get(triggerId);
      trigger ??= this.fallback.triggers.get(triggerId);
      if (!trigger && development()) console.warn(`Base UI: DialogHandle.open: No trigger found with id "${triggerId}". The popup will open, but the trigger will not be associated with it.`);
    }
    controller.request(true, 'imperative-action', undefined, trigger);
  }
  openWithPayload(payload: Payload) {
    const controller = this.current;
    if (!controller) { this.detached('openWithPayload'); return; }
    // This write intentionally survives cancellation of the following opening request.
    controller.payload = payload;
    controller.request(true, 'imperative-action');
  }
  close() {
    if (!this.current) { this.detached('close'); return; }
    this.current.request(false, 'imperative-action');
  }
  get isOpen() { return this.current?.open ?? false; }
}

export function createDialogHandle<Payload = unknown>() { return new DialogHandle<Payload>(); }
