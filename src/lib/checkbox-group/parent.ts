// Derived from Base UI v1.8.0 packages/react/src/checkbox-group/useCheckboxGroupParent.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export type ParentStatus = 'on' | 'off' | 'mixed';

export interface ParentToggleInput {
	value: readonly string[];
	allValues: readonly string[];
	/** Last value committed by a child. Parent toggles do not update it. */
	snapshot: readonly string[];
	status: ParentStatus;
	isDisabled: (value: string) => boolean;
}

export interface ParentToggleResult {
	value: string[];
	/**
	 * Next parent cycle status. Undefined on the all-on / all-off path, which
	 * leaves the status alone, including when the change is canceled.
	 */
	status: ParentStatus | undefined;
}

/**
 * Next value for a parent checkbox click.
 * Disabled unchecked items stay out. Disabled checked items stay in.
 * A partial snapshot cycles mixed → all → none → snapshot.
 */
export function nextParentSelection(input: ParentToggleInput): ParentToggleResult {
	const { value, allValues, snapshot, status, isDisabled } = input;
	const none = allValues.filter((item) => isDisabled(item) && snapshot.includes(item));
	const all = allValues.filter((item) => !isDisabled(item) || snapshot.includes(item));
	const allOnOrOff = snapshot.length === all.length || snapshot.length === 0;

	if (allOnOrOff) {
		if (value.length === all.length) return { value: none, status: undefined };
		return { value: all, status: undefined };
	}

	let nextStatus: ParentStatus = 'mixed';
	let nextValue = snapshot.slice();
	if (status === 'mixed') {
		nextStatus = 'on';
		nextValue = all;
	} else if (status === 'on') {
		nextStatus = 'off';
		nextValue = none;
	}
	return { value: nextValue, status: nextStatus };
}

/**
 * Next value when one child is toggled.
 * An uncheck of a missing value removes the last item (`splice(-1, 1)`), matching upstream.
 */
export function nextChildValue(
	value: readonly string[],
	childValue: string,
	nextChecked: boolean
): string[] {
	const next = value.slice();
	if (nextChecked) next.push(childValue);
	else next.splice(next.indexOf(childValue), 1);
	return next;
}

/** Ids for `aria-controls`, in `allValues` order. Missing keys contribute nothing. */
export function joinedControls(
	allValues: readonly string[],
	registry: { get(value: string): readonly string[] | undefined }
): string | undefined {
	const ids = allValues.flatMap((item) => registry.get(item) ?? []);
	return ids.length > 0 ? ids.join(' ') : undefined;
}
