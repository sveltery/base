// A development check that compares a control's remote form spread with its Field. Every caller
// guards with `DEV`, so a production build drops it together with the name parsing, and a change
// to Kit's internal name format can only break a warning.

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

// Plain, so a warning never reruns the effect that printed it.
const warned = new Set<string>();

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
