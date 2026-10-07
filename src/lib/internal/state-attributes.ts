// Derived from Base UI v1.8.0 packages/react/src/internals/getStateAttributesProps.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

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
