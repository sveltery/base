import { untrack } from 'svelte';
import { DEV } from 'esm-env';
import type { FormContextValue } from '../internal/form-context.js';
import type { FieldContext } from './model.svelte.js';
import { checkSpreadPath } from './spread-checks.js';

/**
 * In development, warns when a control's remote form spread names a field outside its Field.
 * Checks during the render, so the server warns too, and again whenever the name changes.
 */
export function watchSpreadPath(field: FieldContext, form: FormContextValue, name: () => unknown) {
	if (!DEV || !form.remote) return;
	const check = () => checkSpreadPath(field.path, name());
	untrack(check);
	$effect.pre(check);
}
