// Development checks that compare a control's remote form spread with its Field and with the
// control itself. Every caller guards with `DEV`, so a production build drops them together
// with the name parsing, and a change to Kit's internal name format can only break a warning.

import { untrack } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { isWithinField } from '../form/remote-form.js';

/**
 * The field path inside a name that a remote form's `.as()` built, or `null` for any other
 * name. Kit writes `n:` or `b:` before the path, `[]` after an array path, and `/<form id>` last.
 */
export function remoteSpreadPath(name: unknown): string | null {
	if (typeof name !== 'string') return null;
	const slash = name.indexOf('/');
	if (slash <= 0) return null;
	let path = name.slice(0, slash).replace(/^[nbi]:/, '');
	if (path.endsWith('[]')) path = path.slice(0, -2);
	return path;
}

const warned = new SvelteSet<string>();

function warnOnce(message: string) {
	if (warned.has(message)) return;
	warned.add(message);
	console.warn(message);
}

/** Warns when a spread names a field outside the one its `<Field.Root>` reads issues for. */
export function checkSpreadPath(fieldPath: string | undefined, name: unknown) {
	if (fieldPath === undefined) return;
	const spreadPath = remoteSpreadPath(name);
	if (spreadPath === null || isWithinField(spreadPath, fieldPath)) return;
	warnOnce(
		`Base UI: <Field.Root name="${fieldPath}"> contains an input for "${spreadPath}". This is probably not what you wanted: this Field shows no errors for "${spreadPath}". Give <Field.Root> the same path as the spread.`
	);
}

/**
 * Warns when a remote form spread of another input kind lands on a control that renders one
 * input type, such as a radio spread on a Checkbox, or a `select` or `text` spread (no `type`
 * key) on a Slider thumb.
 */
export function checkSpreadKind(
	component: string,
	expected: string,
	props: { name?: unknown; type?: unknown }
) {
	if (remoteSpreadPath(props.name) === null) return;
	if (props.type === expected) return;
	const received =
		typeof props.type === 'string' ? `an \`as('${props.type}')\`` : 'a text or select';
	warnOnce(
		`Base UI: <${component}> received ${received} spread. It renders an input of type "${expected}", so pass \`.as('${expected}')\` instead.`
	);
}

/** Runs `check` during the render, so the server warns too, and again whenever its inputs change. */
export function watchSpread(check: () => void) {
	untrack(check);
	$effect.pre(check);
}
