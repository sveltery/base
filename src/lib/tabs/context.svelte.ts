// Derived from Base UI v1.8.0 packages/react/src/tabs/root/TabsRootContext.ts,
// packages/react/src/tabs/list/TabsListContext.ts and the tab metadata map in TabsRoot.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, setContext, untrack } from 'svelte';
import { byDocumentOrder } from '../internal/document-order.js';
import { REASONS } from '../internal/event-details.js';
import { activationDirection } from './direction.js';
import { createTabsChangeEventDetails } from './events.js';
import { TabsRoving } from './roving-focus.svelte.js';
import type {
	TabsActivationDirection,
	TabsOrientation,
	TabsRootChangeEventDetails,
	TabsRootChangeEventReason,
	TabsValue
} from './types.js';

const TABS_ROOT_CONTEXT = Symbol('tabs-root');
const TABS_LIST_CONTEXT = Symbol('tabs-list');

export interface TabRecord {
	element: HTMLElement;
	value: TabsValue;
	disabled: boolean;
	id: string;
}

export class TabsRootModel {
	tabActivationDirection = $state<TabsActivationDirection>('none');
	tabs = $state<TabRecord[]>([]);
	panelElements = $state<HTMLElement[]>([]);
	panelIds = $state<{ value: TabsValue; id: string }[]>([]);

	readOrientation: () => TabsOrientation = () => 'horizontal';
	readOnValueChange: () =>
		((value: TabsValue | null, eventDetails: TabsRootChangeEventDetails) => void) | undefined =
		() => undefined;
	readExternal: () => TabsValue | null = () => null;
	writeValue: (next: TabsValue | null) => void = () => {};

	/** Writes the bindable. The root component assigns this. */
	publish: (next: TabsValue | null, direction: TabsActivationDirection) => void = () => {};

	readonly parentOwned: boolean;
	private directionBaseline: TabsValue | null = 0;
	private notifiedInitial = false;
	private didRegister = false;
	private lastTabElement: HTMLElement | null = null;

	constructor(parentOwned: boolean, initial: TabsValue | null) {
		this.parentOwned = parentOwned;
		this.directionBaseline = initial;

		$effect.pre(() => {
			const tabs = this.tabs;
			const current = this.value;
			const baseline = this.directionBaseline;
			if (baseline === current) return;
			const next = activationDirection(
				baseline,
				current,
				this.orientation,
				positionOf(tabs, baseline, this.orientation),
				positionOf(tabs, current, this.orientation)
			);
			const incomplete =
				baseline != null && current != null && !tabs.some((tab) => tab.value === current);
			this.tabActivationDirection = next;
			if (!incomplete) this.directionBaseline = current;
		});

		$effect(() => {
			if (this.parentOwned) return;
			const tabs = this.tabs;
			const current = this.value;

			if (tabs.length === 0) {
				if (
					this.didRegister &&
					current !== null &&
					this.lastTabElement != null &&
					!this.lastTabElement.isConnected
				) {
					this.commitAutomatic(null, REASONS.missing);
				}
				return;
			}

			this.didRegister = true;
			this.lastTabElement = tabs[0].element;

			const selected = tabs.find((tab) => tab.value === current);
			const selectionDisabled = selected?.disabled ?? false;
			const selectionMissing = selected == null && current !== null;

			if (selectionDisabled || selectionMissing) {
				const fallback = tabs.find((tab) => !tab.disabled)?.value ?? null;
				if (current === fallback) {
					this.notifiedInitial = true;
					return;
				}
				let reason: TabsRootChangeEventReason = REASONS.missing;
				if (!this.notifiedInitial) reason = REASONS.initial;
				else if (selectionDisabled) reason = REASONS.disabled;
				this.commitAutomatic(fallback, reason);
				return;
			}

			if (!this.notifiedInitial && selected) {
				this.notifiedInitial = true;
				this.publish(current, 'none');
				this.onValueChange?.(
					current,
					createTabsChangeEventDetails(REASONS.initial, undefined, 'none')
				);
			}
		});
	}

	activate(next: TabsValue | null, event: Event) {
		if (next === this.value) return;
		const direction = activationDirection(
			this.value,
			next,
			this.orientation,
			positionOf(this.tabs, this.value, this.orientation),
			positionOf(this.tabs, next, this.orientation)
		);
		const details = createTabsChangeEventDetails(REASONS.none, event, direction);
		this.onValueChange?.(next, details);
		if (details.isCanceled) return;
		this.commit(next, direction);
	}

	get orientation() {
		return this.readOrientation();
	}

	get onValueChange() {
		return this.readOnValueChange();
	}

	get value(): TabsValue | null {
		return this.readExternal();
	}

	set value(next: TabsValue | null) {
		this.writeValue(next);
	}

	registerTab(element: HTMLElement, value: TabsValue, disabled: boolean, id: string) {
		const record: TabRecord = { element, value, disabled, id };
		untrack(() => {
			this.tabs = [...this.tabs, record].sort((a, b) => byDocumentOrder(a.element, b.element));
		});
		return () => {
			untrack(() => {
				this.tabs = this.tabs.filter((tab) => tab.element !== element);
			});
		};
	}

	updateTab(element: HTMLElement, value: TabsValue, disabled: boolean, id: string) {
		const current = this.tabs.find((tab) => tab.element === element);
		if (!current) return;
		if (current.value === value && current.disabled === disabled && current.id === id) return;
		this.tabs = this.tabs.map((tab) =>
			tab.element === element ? { ...tab, value, disabled, id } : tab
		);
	}

	registerPanel(panelValue: TabsValue, panelId: string) {
		untrack(() => {
			this.panelIds = [
				...this.panelIds.filter((panel) => panel.id !== panelId && panel.value !== panelValue),
				{ value: panelValue, id: panelId }
			];
		});
		return () => {
			untrack(() => {
				this.panelIds = this.panelIds.filter((panel) => panel.id !== panelId);
			});
		};
	}

	registerPanelElement(element: HTMLElement) {
		untrack(() => {
			if (!this.panelElements.includes(element)) {
				this.panelElements = [...this.panelElements, element].sort(byDocumentOrder);
			}
		});
		return () => {
			untrack(() => {
				this.panelElements = this.panelElements.filter((item) => item !== element);
			});
		};
	}

	panelIdFor(tabValue: TabsValue) {
		return this.panelIds.find((panel) => panel.value === tabValue)?.id;
	}

	tabIdFor(panelValue: TabsValue) {
		return this.tabs.find((tab) => tab.value === panelValue)?.id;
	}

	tabElement(tabValue: TabsValue | null) {
		if (tabValue == null) return null;
		return this.tabs.find((tab) => tab.value === tabValue)?.element ?? null;
	}

	panelIndex(element: HTMLElement | null) {
		if (!element) return -1;
		return this.panelElements.indexOf(element);
	}

	private commit(next: TabsValue | null, direction: TabsActivationDirection) {
		this.directionBaseline = next;
		this.tabActivationDirection = direction;
		this.publish(next, direction);
	}

	private commitAutomatic(next: TabsValue | null, reason: TabsRootChangeEventReason) {
		this.notifiedInitial = true;
		this.commit(next, 'none');
		this.onValueChange?.(next, createTabsChangeEventDetails(reason, undefined, 'none'));
	}
}

function positionOf(tabs: TabRecord[], value: TabsValue | null, orientation: TabsOrientation) {
	if (value == null) return null;
	const element = tabs.find((tab) => tab.value === value)?.element;
	if (!element) return null;
	const rect = element.getBoundingClientRect();
	return orientation === 'horizontal' ? rect.left : rect.top;
}

export class TabsListModel {
	readActivateOnFocus: () => boolean = () => false;
	listElement = $state<HTMLElement | null>(null);
	resizeRevision = $state(0);
	readonly roving = new TabsRoving();

	get activateOnFocus() {
		return this.readActivateOnFocus();
	}

	private observer: ResizeObserver | null = null;
	private observed: HTMLElement[] = [];

	attachList(element: HTMLElement) {
		this.listElement = element;
		this.ensureObserver();
		this.observer?.observe(element);
		return () => {
			this.observer?.unobserve(element);
			if (this.listElement === element) this.listElement = null;
		};
	}

	observeTab(element: HTMLElement) {
		if (!this.observed.includes(element)) this.observed.push(element);
		this.observer?.observe(element);
		return () => {
			this.observed = this.observed.filter((item) => item !== element);
			this.observer?.unobserve(element);
		};
	}

	private ensureObserver() {
		if (this.observer || typeof ResizeObserver === 'undefined') return;
		this.observer = new ResizeObserver(() => {
			this.resizeRevision += 1;
		});
		for (const element of this.observed) this.observer.observe(element);
		if (this.listElement) this.observer.observe(this.listElement);
	}

	disconnect() {
		this.observer?.disconnect();
		this.observer = null;
	}
}

export function setTabsRootContext(context: TabsRootModel) {
	setContext(TABS_ROOT_CONTEXT, context);
}

export function useTabsRootContext(): TabsRootModel {
	const context = getContext<TabsRootModel | undefined>(TABS_ROOT_CONTEXT);
	if (context === undefined) {
		throw new Error(
			'Base UI: TabsRootContext is missing. Tabs parts must be placed within <Tabs.Root>.'
		);
	}
	return context;
}

export function setTabsListContext(context: TabsListModel) {
	setContext(TABS_LIST_CONTEXT, context);
}

export function useTabsListContext(): TabsListModel {
	const context = getContext<TabsListModel | undefined>(TABS_LIST_CONTEXT);
	if (context === undefined) {
		throw new Error(
			'Base UI: TabsListContext is missing. TabsList parts must be placed within <Tabs.List>.'
		);
	}
	return context;
}
