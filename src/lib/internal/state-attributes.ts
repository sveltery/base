// Derived from Base UI v1.9.0 packages/react/src/internals/getStateAttributesProps.ts
// and packages/react/src/internals/stateAttributesMapping.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import type { TransitionStatusValue } from './useTransitionStatus.svelte.js';

export type StateAttributesMapping<State> = {
	[Property in keyof State]?: (value: State[Property]) => Record<string, string> | null;
};

export function getStateAttributesProps<State extends object>(
	state: State,
	customMapping?: StateAttributesMapping<State>
): Record<string, string> {
	const props: Record<string, string> = {};

	for (const key in state) {
		const value = state[key];

		if (customMapping && Object.hasOwn(customMapping, key)) {
			const customProps = customMapping[key]!(value);
			if (customProps != null) {
				Object.assign(props, customProps);
			}
			continue;
		}

		if (value === true) {
			props[`data-${key.toLowerCase()}`] = '';
		} else if (value) {
			props[`data-${key.toLowerCase()}`] = String(value);
		}
	}

	return props;
}

export const transitionStatusMapping: StateAttributesMapping<{
	transitionStatus: TransitionStatusValue;
}> = {
	transitionStatus(value): Record<string, string> | null {
		if (value === 'starting') return { 'data-starting-style': '' };
		if (value === 'ending') return { 'data-ending-style': '' };
		return null;
	}
};
