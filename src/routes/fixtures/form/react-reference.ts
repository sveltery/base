// React Base UI 1.8.0 counterpart of FormFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { Form } from '@base-ui/react/form';
import type { FormCase } from './cases.js';

export function mountFormReference(node: HTMLElement, scenario: FormCase, onReady: () => void) {
	function App() {
		const [submitted, setSubmitted] = useState(0);
		const [values, setValues] = useState('');
		useEffect(onReady, []);

		const countSubmit = (event: { preventDefault: () => void }) => {
			event.preventDefault();
			setSubmitted((previous) => previous + 1);
		};

		let form;
		if (scenario === 'render') {
			form = h(
				Form,
				{
					id: 'tested-form',
					onSubmit: countSubmit,
					render: (props: ComponentProps<'form'>) => h('form', { ...props, 'data-custom': 'true' })
				},
				h('span', null, 'Inside'),
				h('button', { type: 'submit' }, 'Submit')
			);
		} else if (scenario === 'values') {
			form = h(
				Form,
				{
					id: 'tested-form',
					onFormSubmit: (formValues: Record<string, unknown>) => {
						setValues(JSON.stringify(formValues));
					}
				},
				h('button', { type: 'submit' }, 'Submit')
			);
		} else {
			form = h(
				Form,
				{
					id: 'tested-form',
					noValidate: scenario !== 'browser',
					onSubmit: countSubmit
				},
				scenario === 'unregistered' || scenario === 'browser'
					? h('input', { name: 'email', required: true, 'aria-label': 'Email' })
					: null,
				h('button', { type: 'submit' }, 'Submit')
			);
		}

		return h(
			Fragment,
			null,
			form,
			h('output', { 'data-testid': 'submitted' }, String(submitted)),
			h('output', { 'data-testid': 'values' }, values)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
