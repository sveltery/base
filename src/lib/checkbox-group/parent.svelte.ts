// Derived from Base UI v1.8.0 packages/react/src/checkbox-group/useCheckboxGroupParent.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { CheckboxGroupChangeDetails } from '../checkbox/group-context.js';
import {
	joinedControls,
	nextChildValue,
	nextParentSelection,
	type ParentStatus
} from './parent.js';

/**
 * Parent-checkbox state for one CheckboxGroup.
 * The snapshot updates only after a child change that was not canceled.
 */
export class CheckboxGroupParent {
	status = $state<ParentStatus>('mixed');
	snapshot = $state<string[]>([]);
	private readonly registry = new SvelteMap<string, readonly string[]>();
	private readonly disabledStates = new SvelteMap<string, boolean>();
	private readonly readValue: () => readonly string[];
	private readonly readAllValues: () => readonly string[];
	private readonly commit: (value: string[], details: CheckboxGroupChangeDetails) => void;

	constructor(options: {
		readValue: () => readonly string[];
		readAllValues: () => readonly string[];
		commit: (value: string[], details: CheckboxGroupChangeDetails) => void;
	}) {
		this.readValue = options.readValue;
		this.readAllValues = options.readAllValues;
		this.commit = options.commit;
		this.snapshot = [...options.readValue()];
	}

	get checked() {
		return this.readValue().length === this.readAllValues().length;
	}

	get indeterminate() {
		const length = this.readValue().length;
		return length !== this.readAllValues().length && length > 0;
	}

	get controls() {
		return joinedControls(this.readAllValues(), this.registry);
	}

	toggle(details: CheckboxGroupChangeDetails) {
		const result = nextParentSelection({
			value: this.readValue(),
			allValues: this.readAllValues(),
			snapshot: this.snapshot,
			status: this.status,
			isDisabled: (item) => Boolean(this.disabledStates.get(item))
		});
		this.commit(result.value, details);
		if (!details.isCanceled && result.status !== undefined) this.status = result.status;
	}

	toggleChild(childValue: string, nextChecked: boolean, details: CheckboxGroupChangeDetails) {
		const next = nextChildValue(this.readValue(), childValue, nextChecked);
		this.commit(next, details);
		if (!details.isCanceled) {
			this.snapshot = next;
			this.status = 'mixed';
		}
	}

	registerChildId(childValue: string, childId: string) {
		// The caller is an effect. Reading and writing the registry there retriggers it.
		untrack(() => {
			const ids = this.registry.get(childValue);
			if (!ids?.includes(childId)) {
				this.registry.set(childValue, ids ? ids.concat(childId) : [childId]);
			}
		});

		return () => {
			untrack(() => {
				const registered = this.registry.get(childValue);
				if (!registered?.includes(childId)) return;
				const nextIds = registered.filter((id) => id !== childId);
				if (nextIds.length === 0) this.registry.delete(childValue);
				else this.registry.set(childValue, nextIds);
			});
		};
	}

	setDisabled(childValue: string, disabled: boolean) {
		// Written from an effect. Skip tracking so the write does not retrigger it.
		untrack(() => {
			this.disabledStates.set(childValue, disabled);
		});
	}

	clearDisabled(childValue: string) {
		untrack(() => {
			this.disabledStates.delete(childValue);
		});
	}
}
