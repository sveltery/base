import { createElement as h, Fragment, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Form } from '@base-ui/react/form';

export type FixtureProps<T> = T & { 'data-testid'?: string };

/**
 * Base UI's published prop types omit `data-*` attributes the DOM still accepts.
 * Returning `never` is the escape the per-fixture helpers used before they were shared.
 */
export function passProps(props: object) {
	return props as never;
}

export function mountApp(node: HTMLElement, App: () => ReactNode) {
	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}

export function countSubmit(setSubmitted: (update: (previous: number) => number) => void) {
	return (event: { preventDefault: () => void }) => {
		event.preventDefault();
		setSubmitted((previous) => previous + 1);
	};
}

export function storeValues(setValues: (value: string) => void) {
	return (formValues: Record<string, unknown>) => {
		setValues(JSON.stringify(formValues));
	};
}

export function submittedForm(
	onSubmit: (event: { preventDefault: () => void }) => void,
	field: ReactNode,
	submitted: number
) {
	return h(
		Fragment,
		null,
		h(Form, { onSubmit }, field, h('button', { type: 'submit' }, 'Submit')),
		h('output', { 'data-testid': 'submitted' }, String(submitted))
	);
}

export function valuesForm(
	onFormSubmit: (formValues: Record<string, unknown>) => void,
	field: ReactNode,
	values: string
) {
	return h(
		Fragment,
		null,
		h(Form, { onFormSubmit }, field, h('button', { type: 'submit' }, 'Submit')),
		h('output', { 'data-testid': 'values' }, values)
	);
}
