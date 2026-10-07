// React Base UI 1.8.0 counterpart of RadioFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Radio } from '@base-ui/react/radio';
import type { RadioCase } from './cases.js';

function partProps(props: object) {
	return props as never;
}

export function mountRadioReference(node: HTMLElement, scenario: RadioCase, onReady: () => void) {
	function App() {
		const [parentClicks, setParentClicks] = useState(0);
		const [submitted, setSubmitted] = useState(0);
		useEffect(onReady, []);

		function stop(event: { stopPropagation: () => void }) {
			if (scenario === 'stop') event.stopPropagation();
		}

		function onSubmit(event: { preventDefault: () => void }) {
			event.preventDefault();
			setSubmitted((count) => count + 1);
		}

		let control: ReactNode = h(Radio.Root, { id: 'tested-radio', value: 'blue' }, 'Blue');

		if (scenario === 'checked') {
			control = h(
				Radio.Root,
				{ id: 'tested-radio', value: '' },
				h(Radio.Indicator, partProps({ 'data-testid': 'indicator' })),
				'Checked'
			);
		} else if (scenario === 'disabled' || scenario === 'readonly') {
			control = h(
				Radio.Root,
				{
					id: 'tested-radio',
					value: 'blue',
					disabled: scenario === 'disabled',
					readOnly: scenario === 'readonly'
				},
				'Blue'
			);
		} else if (scenario === 'label') {
			control = h(
				Fragment,
				null,
				h('label', { htmlFor: 'tested-radio' }, 'Label'),
				h(Radio.Root, { id: 'tested-radio', value: 'blue' }, 'Blue')
			);
		} else if (scenario === 'native') {
			control = h(
				Radio.Root,
				{
					id: 'tested-radio',
					value: 'blue',
					nativeButton: true,
					render: h('button'),
					'aria-label': 'Blue'
				},
				'Blue'
			);
		} else if (scenario === 'required' || scenario === 'enter') {
			control = h(
				'form',
				{ onSubmit },
				h(
					Radio.Root,
					{ id: 'tested-radio', value: 'blue', required: scenario === 'required' },
					'Blue'
				),
				h('button', { type: 'submit' }, 'Submit')
			);
		} else if (scenario === 'null') {
			control = h(Radio.Root, { id: 'tested-radio', value: null }, 'None');
		} else if (scenario === 'bubble' || scenario === 'stop') {
			control = h(
				'div',
				{ 'data-testid': 'parent', onClick: () => setParentClicks((count) => count + 1) },
				h(Radio.Root, { id: 'tested-radio', value: 'blue', onClick: stop }, 'Blue')
			);
		}

		return h(
			Fragment,
			null,
			control,
			h('output', { 'data-testid': 'parent-clicks' }, String(parentClicks)),
			h('output', { 'data-testid': 'submitted' }, String(submitted))
		);
	}

	const root: Root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
