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
