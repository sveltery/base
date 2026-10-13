// React Base UI 1.9.0 counterpart of MenuFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Menu } from '@base-ui/react/menu';
import type { MenuCase } from './cases.js';

type Call = { open: boolean; reason: string };
type Highlight = { item: string | null; reason: string; label: string | null };

export function mountMenuReference(node: HTMLElement, scenario: MenuCase, onReady: () => void) {
	function App() {
		const [calls, setCalls] = useState<Call[]>([]);
		const [subcalls, setSubcalls] = useState<Call[]>([]);
		const [highlights, setHighlights] = useState<Highlight[]>([]);
		const [clicks, setClicks] = useState<string[]>([]);
		const [bold, setBold] = useState(false);
		const [size, setSize] = useState<unknown>('small');
		useEffect(onReady, []);

		function item(label: string) {
			return h(
				Menu.Item,
				{ key: label, onClick: () => setClicks((list) => list.concat(label)) },
				label
			);
		}

		const content =
			scenario === 'choices'
				? h(
						Fragment,
						null,
						h(
							Menu.CheckboxItem,
							{ checked: bold, onCheckedChange: setBold },
							h(Menu.CheckboxItemIndicator, { 'data-testid': 'bold-indicator' } as never, '✓'),
							'Bold'
						),
						h(Menu.Separator),
						h(
							Menu.RadioGroup,
							{ value: size, onValueChange: setSize },
							h(Menu.GroupLabel, null, 'Size'),
							h(
								Menu.RadioItem,
								{ value: 'small' },
								h(Menu.RadioItemIndicator, { 'data-testid': 'small-indicator' } as never, '•'),
								'Small'
							),
							h(
								Menu.RadioItem,
								{ value: 'large' },
								h(Menu.RadioItemIndicator, { 'data-testid': 'large-indicator' } as never, '•'),
								'Large'
							)
						)
					)
				: h(
						Fragment,
						null,
						item('Apple'),
						scenario === 'submenu' || scenario === 'delay'
							? h(
									Menu.SubmenuRoot,
									{
										onOpenChange: (open: boolean, details: { reason: string }) =>
											setSubcalls((list) => list.concat({ open, reason: details.reason }))
									},
									h(
										Menu.SubmenuTrigger,
										{ closeDelay: scenario === 'delay' ? 400 : 0 } as never,
										'More'
									),
									h(
										Menu.Portal,
										null,
										h(Menu.Positioner, null, h(Menu.Popup, null, item('Delta'), item('Echo')))
									)
								)
							: item('Banana'),
						item('Cherry')
					);

		return h(
			Fragment,
			null,
			h('button', { type: 'button' }, 'Outside'),
			h('pre', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('pre', { 'data-testid': 'subcalls' }, JSON.stringify(subcalls)),
			h('pre', { 'data-testid': 'highlights' }, JSON.stringify(highlights)),
			h('pre', { 'data-testid': 'clicks' }, JSON.stringify(clicks)),
			h('pre', { 'data-testid': 'choices' }, JSON.stringify({ bold, size })),
			h(
				Menu.Root,
				{
					onOpenChange: (open: boolean, details: { reason: string }) =>
						setCalls((list) => list.concat({ open, reason: details.reason })),
					onItemHighlighted: (
						item: HTMLElement | undefined,
						details: { reason: string; label: string | undefined }
					) =>
						setHighlights((list) =>
							list.concat({
								item: item?.textContent?.trim() ?? null,
								reason: details.reason,
								label: details.label ?? null
							})
						)
				},
				h(Menu.Trigger, { openOnHover: scenario === 'hover', delay: 0 } as never, 'Open'),
				h(Menu.Portal, null, h(Menu.Positioner, null, h(Menu.Popup, null, content)))
			)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
