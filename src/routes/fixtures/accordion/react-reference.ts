// React Base UI 1.8.0 counterpart of AccordionFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Accordion } from '@base-ui/react/accordion';
import type { AccordionCase } from './cases.js';

function partProps(props: object) {
	return props as never;
}

type Call = { value: unknown[]; reason: string; canceled: boolean };

export function mountAccordionReference(
	node: HTMLElement,
	scenario: AccordionCase,
	onReady: () => void
) {
	function App() {
		const [value, setValue] = useState<string[]>(scenario === 'open' ? ['one'] : []);
		const [calls, setCalls] = useState<Call[]>([]);
		useEffect(onReady, []);

		function changed(
			next: string[],
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) {
			if (scenario === 'cancel') details.cancel();
			const call = { value: next, reason: details.reason, canceled: details.isCanceled };
			setCalls((previous) => [...previous, call]);
			if (scenario === 'bound' && !details.isCanceled) setValue(next);
		}

		const rootProps =
			scenario === 'open'
				? { defaultValue: ['one'], onValueChange: changed }
				: {
						...(scenario === 'bound'
							? { value, onValueChange: changed }
							: { onValueChange: changed }),
						multiple: scenario === 'multiple' ? true : undefined,
						disabled: scenario === 'disabled' ? true : undefined,
						keepMounted: scenario === 'mounted' || scenario === 'search' ? true : undefined,
						hiddenUntilFound: scenario === 'search' ? true : undefined
					};

		return h(
			Fragment,
			null,
			scenario === 'bound'
				? h('input', {
						type: 'checkbox',
						'aria-label': 'Owner one',
						checked: value.includes('one'),
						onChange: () => setValue(value.includes('one') ? [] : ['one'])
					})
				: null,
			h(
				Accordion.Root,
				partProps({ ...rootProps, 'data-testid': 'root' }),
				h(
					Accordion.Item,
					{ value: 'one' },
					h(
						Accordion.Header,
						null,
						h(
							Accordion.Trigger,
							{
								onClick: (event: { preventBaseUIHandler: () => void }) => {
									if (scenario === 'prevented') event.preventBaseUIHandler();
								}
							},
							'One'
						)
					),
					h(Accordion.Panel, partProps({ 'data-testid': 'panel-one' }), 'Panel one')
				),
				h(
					Accordion.Item,
					{ value: 'two' },
					h(Accordion.Header, null, h(Accordion.Trigger, null, 'Two')),
					h(Accordion.Panel, partProps({ 'data-testid': 'panel-two' }), 'Panel two')
				)
			),
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls))
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
