// Ported from Base UI v1.8.0 useCollapsibleRoot at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { Controlled } from '@sveltery/utils/Controlled';
import { useBaseUiId } from '../../internals/useBaseUiId.js';
import { REASONS } from '../../internals/reasons.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
import type { CollapsibleRootChangeEventDetails } from '../types.js';

export interface UseCollapsibleRootParameters {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange: (open: boolean, details: CollapsibleRootChangeEventDetails) => void;
  disabled: boolean;
}

export class CollapsibleRoot {
  #parameters: () => UseCollapsibleRootParameters;
  #open: Controlled<boolean>;
  #transition: ReturnType<typeof useTransitionStatus>;
  #registeredPanelId = $state<string | null | undefined>();
  readonly defaultPanelId: string;

  constructor(getParameters: () => UseCollapsibleRootParameters, nativeId: string) {
    this.#parameters = getParameters;
    this.#open = new Controlled(
      () => getParameters().open,
      untrack(() => getParameters().defaultOpen ?? false),
    );
    this.#transition = useTransitionStatus(() => this.open, true, true);
    this.defaultPanelId = useBaseUiId(undefined, nativeId);
  }

  get disabled() {
    return this.#parameters().disabled;
  }
  get mounted() {
    return this.#transition.mounted;
  }
  get open() {
    return this.#open.value;
  }
  get panelId() {
    return this.#registeredPanelId === null
      ? undefined
      : (this.#registeredPanelId ?? this.defaultPanelId);
  }
  get transitionStatus() {
    return this.#transition.transitionStatus;
  }
  setMounted = (next: boolean) => this.#transition.setMounted(next);
  setOpen = (next: boolean) => this.#open.set(next);
  setPanelIdState = (
    next:
      | string
      | null
      | undefined
      | ((current: string | null | undefined) => string | null | undefined),
  ) => {
    this.#registeredPanelId = typeof next === 'function' ? next(this.#registeredPanelId) : next;
  };
  handleTrigger = (event: MouseEvent | KeyboardEvent) => {
    const nextOpen = !this.open;
    const eventDetails = createChangeEventDetails(REASONS.triggerPress, event);
    this.#parameters().onOpenChange(nextOpen, eventDetails);
    if (eventDetails.isCanceled) return;
    this.setOpen(nextOpen);
  };
}
