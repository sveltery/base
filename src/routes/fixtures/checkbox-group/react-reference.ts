// React Base UI 1.8.0 counterpart of CheckboxGroupFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Checkbox } from '@base-ui/react/checkbox';
import { CheckboxGroup } from '@base-ui/react/checkbox-group';
import type { CheckboxGroupCase } from './cases.js';

type Call = { value: string[]; reason: string; canceled: boolean };

function partProps(props: object) {
	return props as never;
}

export function mountCheckboxGroupReference(
	node: HTMLElement,
	scenario: CheckboxGroupCase,
	onReady: () => void
) {
	function App() {
		const [value, setValue] = useState<string[]>(scenario === 'initial' ? ['b'] : []);
		const [calls, setCalls] = useState<Call[]>([]);
		const [submitted, setSubmitted] = useState<string[]>([]);
		useEffect(onReady, []);

		function onValueChange(
			next: string[],
			details: { reason: string; cancel: () => void; isCanceled: boolean }
		) {
			if (scenario === 'cancel') details.cancel();
			const call = { value: [...next], reason: details.reason, canceled: details.isCanceled };
			setCalls((previous) => [...previous, call]);
			if (
				(scenario === 'bound' || scenario === 'select' || scenario === 'parent') &&
				!details.isCanceled
			) {
				setValue(next);
			}
		}

		function toggleOwner() {
			setValue((current) =>
				current.includes('b') ? current.filter((item) => item !== 'b') : [...current, 'b']
			);
		}

		let body: ReactNode;

		if (scenario === 'bound') {
			body = h(
				Fragment,
				null,
				h('input', {
					type: 'checkbox',
					'aria-label': 'Owner B',
					checked: value.includes('b'),
					onClick: toggleOwner
				}),
				h(
					CheckboxGroup,
					partProps({ 'aria-label': 'Colors', value, onValueChange }),
					h(Checkbox.Root, { value: 'a' }, 'A'),
					h(Checkbox.Root, { value: 'b' }, 'B')
				)
			);
		} else if (scenario === 'form') {
			body = h(
				'form',
				{
					onSubmit: (event: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
						event.preventDefault();
						setSubmitted(
							Array.from(new FormData(event.currentTarget).getAll('topping')).filter(
								(entry): entry is string => typeof entry === 'string'
							)
						);
					}
				},
				h(
					CheckboxGroup,
					partProps({
						'aria-label': 'Colors',
						allValues: ['a', 'b'],
						value,
						onValueChange: setValue
					}),
					h(Checkbox.Root, { parent: true }, 'All'),
					h(Checkbox.Root, { name: 'topping', value: 'a' }, 'A'),
					h(Checkbox.Root, { name: 'topping', value: 'b' }, 'B')
				),
				h('button', { type: 'submit' }, 'Submit')
			);
		} else if (scenario === 'parent') {
			body = h(
				CheckboxGroup,
				partProps({ 'aria-label': 'Colors', allValues: ['a', 'b'], onValueChange }),
				h(Checkbox.Root, { parent: true }, 'All'),
				h(Checkbox.Root, { value: 'a' }, 'A'),
				h(Checkbox.Root, { value: 'b' }, 'B')
			);
		} else if (scenario === 'initial') {
			body = h(
				CheckboxGroup,
				partProps({ 'aria-label': 'Colors', value: ['b'] }),
				h(Checkbox.Root, { value: 'a' }, 'A'),
				h(Checkbox.Root, { value: 'b' }, 'B')
			);
		} else {
			body = h(
				CheckboxGroup,
				partProps({
					'aria-label': 'Colors',
					disabled: scenario === 'disabled',
					onValueChange
				}),
				h(Checkbox.Root, { value: 'a' }, 'A'),
				h(Checkbox.Root, { value: 'b' }, 'B')
			);
		}

		return h(
			Fragment,
			null,
			body,
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('output', { 'data-testid': 'submitted' }, JSON.stringify(submitted))
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
