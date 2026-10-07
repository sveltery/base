// React Base UI 1.8.0 counterpart of RadioGroupFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Fieldset } from '@base-ui/react/fieldset';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import type { RadioGroupCase } from './cases.js';

type Call = { value: string; reason: string; canceled: boolean };

const labels = ['A', 'B', 'C'] as const;
const itemValues = ['a', 'b', 'c'] as const;

export function mountRadioGroupReference(
	node: HTMLElement,
	scenario: RadioGroupCase,
	onReady: () => void
) {
	function App() {
		// `undefined` on the first render makes Base UI treat the group as uncontrolled
		// for its lifetime, so a later owner update would not select a radio.
		const [value, setValue] = useState<string | null>(null);
		const [calls, setCalls] = useState<Call[]>([]);
		const [submitted, setSubmitted] = useState(0);
		useEffect(onReady, []);

		const count = scenario === 'keyboard' || scenario === 'rtl' ? 3 : 2;

		function onValueChange(
			next: unknown,
			details: { reason: string; cancel: () => void; isCanceled: boolean }
		) {
			if (scenario === 'cancel') details.cancel();
			const text = typeof next === 'string' ? next : '';
			const call = { value: text, reason: details.reason, canceled: details.isCanceled };
			setCalls((previous) => [...previous, call]);
			if (scenario === 'bound' && !details.isCanceled && typeof next === 'string') {
				setValue(next);
			}
		}

		const radios = itemValues
			.slice(0, count)
			.map((itemValue, index) =>
				h(Radio.Root, { key: itemValue, value: itemValue }, labels[index])
			);

		const groupProps = {
			'aria-label': 'Colors',
			disabled: scenario === 'disabled',
			readOnly: scenario === 'readonly',
			...(scenario === 'initial' ? { value: 'b' } : {}),
			...(scenario === 'bound' ? { value, onValueChange } : {}),
			...(scenario === 'select' ||
			scenario === 'keyboard' ||
			scenario === 'rtl' ||
			scenario === 'cancel' ||
			scenario === 'disabled' ||
			scenario === 'readonly'
				? { onValueChange }
				: {})
		};

		let body: ReactNode = h(RadioGroup, groupProps, radios);

		if (scenario === 'required') {
			body = h(
				'form',
				{
					onSubmit: (event: { preventDefault(): void }) => {
						event.preventDefault();
						setSubmitted((countSubmitted) => countSubmitted + 1);
					}
				},
				h(
					RadioGroup,
					{ 'aria-label': 'Colors', name: 'color', required: true, onValueChange },
					radios
				),
				h('button', { type: 'submit' }, 'Submit')
			);
		} else if (scenario === 'legend') {
			body = h(
				Fieldset.Root,
				null,
				h(Fieldset.Legend, null, 'Legend'),
				h(RadioGroup, null, h(Radio.Root, { value: 'a' }, 'A'), h(Radio.Root, { value: 'b' }, 'B'))
			);
		} else if (scenario === 'initial') {
			body = h(
				RadioGroup,
				{ 'aria-label': 'Colors', value: 'b' },
				h(Radio.Root, { value: 'a' }, 'A'),
				h(Radio.Root, { value: 'b' }, 'B')
			);
		} else if (scenario === 'bound') {
			body = h(
				Fragment,
				null,
				h('input', {
					type: 'checkbox',
					'aria-label': 'Owner B',
					checked: value === 'b',
					onClick: () => setValue(value === 'b' ? null : 'b')
				}),
				h(
					RadioGroup,
					{ 'aria-label': 'Colors', value, onValueChange },
					h(Radio.Root, { value: 'a' }, 'A'),
					h(Radio.Root, { value: 'b' }, 'B')
				)
			);
		}

		const wrapped = scenario === 'rtl' ? h(DirectionProvider, { direction: 'rtl' }, body) : body;

		return h(
			Fragment,
			null,
			h('div', { dir: scenario === 'rtl' ? 'rtl' : 'ltr' }, wrapped),
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('output', { 'data-testid': 'submitted' }, String(submitted)),
			h('output', { 'data-testid': 'value' }, value ?? 'none')
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
