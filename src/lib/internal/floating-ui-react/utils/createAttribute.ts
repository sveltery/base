// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/createAttribute.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export function createAttribute(name: string) {
	return `data-base-ui-${name}`;
}
