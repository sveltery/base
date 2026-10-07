// React Base UI 1.8.0 counterpart of TabsFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';

function partProps(props: object) {
	return props as never;
}
import { createRoot } from 'react-dom/client';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs } from '@base-ui/react/tabs';
import type { TabsCase } from './cases.js';

type Call = { value: unknown; reason: string; canceled: boolean };

const labels = ['One', 'Two', 'Three'] as const;

export function mountTabsReference(node: HTMLElement, scenario: TabsCase, onReady: () => void) {
	function App() {
		const [value, setValue] = useState<number | null>(0);
		const [calls, setCalls] = useState<Call[]>([]);
		useEffect(onReady, []);

		const count =
			scenario === 'keyboard' ||
			scenario === 'vertical' ||
			scenario === 'rtl' ||
			scenario === 'loop'
				? 3
				: 2;

		function onValueChange(
			next: number | null,
			details: { reason: string; cancel: () => void; isCanceled: boolean }
		) {
			if (scenario === 'cancel' && details.reason === 'none') details.cancel();
			const call = { value: next, reason: details.reason, canceled: details.isCanceled };
			setCalls((previous) => [...previous, call]);
			if (scenario === 'bound' && !details.isCanceled) setValue(next);
		}

		const tabItems = labels.slice(0, count).map((label, index) =>
			h(
				Tabs.Tab,
				{
					key: label,
					value: index,
					disabled:
						(scenario === 'fallback' && index === 0) || (scenario === 'disabled' && index === 1)
				},
				label
			)
		);

		const panels = labels
			.slice(0, count)
			.map((label, index) => h(Tabs.Panel, { key: label, value: index }, `${label} panel`));

		const list = h(
			Tabs.List,
			{
				'aria-label': 'Sections',
				activateOnFocus: scenario === 'follow',
				loopFocus: scenario === 'loop' ? false : undefined
			},
			...tabItems,
			h(Tabs.Indicator, partProps({ 'data-testid': 'indicator' }))
		);

		const root = h(
			Tabs.Root,
			{
				orientation: scenario === 'vertical' ? 'vertical' : 'horizontal',
				onValueChange,
				...(scenario === 'bound' ? { value } : {})
			},
			list,
			...panels
		);

		const body = scenario === 'rtl' ? h(DirectionProvider, { direction: 'rtl' }, root) : root;

		return h(
			Fragment,
			null,
			scenario === 'bound'
				? h('input', {
						type: 'checkbox',
						'aria-label': 'Owner two',
						checked: value === 1,
						onClick: () => setValue(value === 1 ? 0 : 1)
					})
				: null,
			h('div', { dir: scenario === 'rtl' ? 'rtl' : 'ltr' }, body),
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls))
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
