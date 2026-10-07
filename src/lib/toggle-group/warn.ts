// Same text as Base UI's dev error() for a Toggle inside an initialized ToggleGroup
// (packages/react/src/toggle/Toggle.tsx, commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
const MESSAGE =
	'Base UI: A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop. This will cause issues between the Toggle Group and Toggle values. Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.';

let warned = false;

/** Logs once per page, matching Base UI's createLogOnce. */
export function warnMissingToggleValue() {
	if (warned) return;
	warned = true;
	console.error(MESSAGE);
}
