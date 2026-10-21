// A remote form whose `fields` is Kit's own proxy, so specs spread exactly what
// `form.fields.x.as()` returns, getters included.
// @ts-expect-error -- Kit does not export or type its form internals.
import { create_field_proxy } from '../../node_modules/@sveltejs/kit/src/runtime/form-utils.js';

/** Kit's `fields` for a form whose values are `input`. */
export function kitFields(input: Record<string, unknown> = {}, formId = 'form') {
	return create_field_proxy({
		form_id: formId,
		get: () => input,
		set() {},
		get_issues: () => ({}),
		get_touched: () => ({}),
		get_dirty: () => ({})
	});
}

/** A remote form instance as `<Form form>` reads it, on Kit's `fields`. */
export function kitRemoteForm(input: Record<string, unknown> = {}) {
	return {
		method: 'POST' as const,
		action: '?/remote=form',
		fields: kitFields(input),
		pending: 0,
		submitted: false
	};
}
