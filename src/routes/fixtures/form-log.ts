export function takeForm(
	formValues: Record<string, unknown>,
	details: { event: Event },
	submitted: number
) {
	details.event.preventDefault();
	return { submitted: submitted + 1, values: JSON.stringify(formValues) };
}

export function readNamedForm(
	event: SubmitEvent,
	name: string,
	submitted: number,
	values: (string | null)[]
) {
	event.preventDefault();
	const nextSubmitted = submitted + 1;
	const form = event.currentTarget;
	if (!(form instanceof HTMLFormElement)) return { submitted: nextSubmitted, values };
	const value = new FormData(form).get(name);
	return {
		submitted: nextSubmitted,
		values: [...values, typeof value === 'string' ? value : null]
	};
}

/**
 * The submitted values by name, as the server would read them: one string, or several.
 * Names in `lists` always read as a list, the way a server reads a checkbox group.
 */
export function formDataValues(
	form: HTMLFormElement,
	submitter?: HTMLElement | null,
	lists: readonly string[] = []
) {
	const data = new FormData(form, submitter);
	const values: Record<string, string | string[]> = {};
	for (const key of new Set(data.keys())) {
		const all = data.getAll(key).map((value) => (typeof value === 'string' ? value : value.name));
		values[key] = all.length > 1 || lists.includes(key) ? all : all[0];
	}
	return values;
}

/**
 * A Form `onsubmit` that keeps the page and hands the submitted values to `accept`,
 * the way a client-only form reads them.
 */
export function submitTo(
	accept: ((formValues: Record<string, unknown>, details: { event: Event }) => void) | undefined,
	lists?: readonly string[]
) {
	return (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => {
		if (!accept) return;
		event.preventDefault();
		accept(formDataValues(event.currentTarget, event.submitter, lists), { event });
	};
}
