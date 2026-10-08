// React Base UI 1.8.0 counterpart of ToggleGroupFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { mountApp } from '../react-fixture.js';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import type { ToggleGroupCase } from './cases.js';

type Call = { value: string[]; reason: string; canceled: boolean };

const labels = ['One', 'Two', 'Three'] as const;
const itemValues = ['one', 'two', 'three'] as const;

export function mountToggleGroupReference(
	node: HTMLElement,
	scenario: ToggleGroupCase,
	onReady: () => void
) {
	function App() {
		const [value, setValue] = useState<string[]>([]);
		const [calls, setCalls] = useState<Call[]>([]);
		useEffect(onReady, []);

		const count = scenario === 'keyboard' || scenario === 'rtl' || scenario === 'vertical' ? 3 : 2;
		const items = itemValues
			.slice(0, count)
			.map((itemValue, index) => h(Toggle, { key: itemValue, value: itemValue }, labels[index]));

		function onValueChange(
			next: string[],
			details: { reason: string; cancel: () => void; isCanceled: boolean }
		) {
			if (scenario === 'cancel') details.cancel();
			const call = { value: next, reason: details.reason, canceled: details.isCanceled };
			setCalls((previous) => [...previous, call]);
			if ((scenario === 'bound' || scenario === 'exclusive') && !details.isCanceled) setValue(next);
		}

		const group = h(
			ToggleGroup,
			{
				'aria-label': 'Formatting',
				orientation: scenario === 'vertical' ? 'vertical' : 'horizontal',
				multiple: scenario === 'multiple',
				disabled: scenario === 'disabled',
				...(scenario === 'bound' ? { value, onValueChange } : {}),
				...(scenario === 'exclusive' || scenario === 'cancel' || scenario === 'disabled'
					? { onValueChange }
					: {})
			},
			items
		);

		const body =
			scenario === 'rtl'
				? h(DirectionProvider, { direction: 'rtl' }, group)
				: scenario === 'bound'
					? h(
							Fragment,
							null,
							h('input', {
								type: 'checkbox',
								'aria-label': 'Owner two',
								checked: value.includes('two'),
								onClick: () => setValue(value.includes('two') ? [] : ['two'])
							}),
							group
						)
					: group;

		return h(
			Fragment,
			null,
			h('div', { dir: scenario === 'rtl' ? 'rtl' : 'ltr' }, body),
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls))
		);
	}

	return mountApp(node, App);
}
