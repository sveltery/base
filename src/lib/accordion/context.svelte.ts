// Derived from Base UI v1.8.0 packages/react/src/accordion/root/AccordionRootContext.ts
// and packages/react/src/accordion/item/AccordionItemContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, setContext, untrack } from 'svelte';
import { ElementList } from '../internal/element-list.svelte.js';
import type {
	AccordionItemState,
	AccordionOrientation,
	AccordionRootChangeEventDetails
} from './types.js';
import { nextAccordionValue } from './value.js';

const ACCORDION_ROOT_CONTEXT = Symbol('accordion-root');
const ACCORDION_ITEM_CONTEXT = Symbol('accordion-item');

export class AccordionRootModel {
	readonly items = new ElementList();
	commit: (next: unknown[]) => void = () => {};

	constructor(
		private readonly readValues: () => unknown[],
		private readonly readDisabled: () => boolean,
		private readonly readMultiple: () => boolean,
		private readonly readOrientation: () => AccordionOrientation,
		private readonly readHiddenUntilFound: () => boolean,
		private readonly readKeepMounted: () => boolean,
		private readonly readOnValueChange: () =>
			((value: unknown[], eventDetails: AccordionRootChangeEventDetails) => void) | undefined
	) {}

	get values() {
		return this.readValues();
	}

	get disabled() {
		return this.readDisabled();
	}

	get multiple() {
		return this.readMultiple();
	}

	get orientation() {
		return this.readOrientation();
	}

	get hiddenUntilFound() {
		return this.readHiddenUntilFound();
	}

	get keepMounted() {
		return this.readKeepMounted();
	}

	handleValueChange(
		itemValue: unknown,
		nextOpen: boolean,
		eventDetails: AccordionRootChangeEventDetails
	) {
		const next = nextAccordionValue(this.values, itemValue, nextOpen, this.multiple);
		this.readOnValueChange()?.(next, eventDetails);
		if (eventDetails.isCanceled) return;
		this.commit(next);
	}
}

export class AccordionItemModel {
	registeredTriggerId = $state<string | null | undefined>(undefined);
	readonly defaultTriggerId: string;
	private readonly readState: () => AccordionItemState;

	constructor(defaultTriggerId: string, readState: () => AccordionItemState) {
		this.defaultTriggerId = defaultTriggerId;
		this.readState = readState;
	}

	get state(): AccordionItemState {
		return this.readState();
	}

	get triggerId(): string | undefined {
		if (this.registeredTriggerId === null) return undefined;
		return this.registeredTriggerId ?? this.defaultTriggerId;
	}

	registerTrigger(registeredId: string | undefined) {
		const current = untrack(() => this.registeredTriggerId);
		const next = registeredId ?? (current === null ? undefined : current);
		if (next !== current) this.registeredTriggerId = next;
	}

	unregisterTrigger(registeredId: string | undefined) {
		const current = untrack(() => this.registeredTriggerId);
		if (current === registeredId) this.registeredTriggerId = null;
	}
}

export function setAccordionRootContext(context: AccordionRootModel) {
	setContext(ACCORDION_ROOT_CONTEXT, context);
}

export function useAccordionRootContext(): AccordionRootModel {
	const context = getContext<AccordionRootModel | undefined>(ACCORDION_ROOT_CONTEXT);
	if (context === undefined) {
		throw new Error(
			'Base UI: AccordionRootContext is missing. Accordion parts must be placed within <Accordion.Root>.'
		);
	}
	return context;
}

export function setAccordionItemContext(context: AccordionItemModel) {
	setContext(ACCORDION_ITEM_CONTEXT, context);
}

export function useAccordionItemContext(): AccordionItemModel {
	const context = getContext<AccordionItemModel | undefined>(ACCORDION_ITEM_CONTEXT);
	if (context === undefined) {
		throw new Error(
			'Base UI: AccordionItemContext is missing. Accordion parts must be placed within <Accordion.Item>.'
		);
	}
	return context;
}
