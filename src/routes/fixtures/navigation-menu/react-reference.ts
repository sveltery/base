// React Base UI 1.9.0 counterpart of NavigationMenuFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import type { NavigationMenuCase } from './cases.js';

function partProps(props: object) {
	return props as never;
}

type Call = { value: string | null; reason: string };

export function mountNavigationMenuReference(
	node: HTMLElement,
	scenario: NavigationMenuCase,
	onReady: () => void
) {
	const timing = scenario === 'delays' ? { delay: 400, closeDelay: 400 } : {};
	const orientation = scenario === 'vertical' ? 'vertical' : 'horizontal';
	const listStyle = { display: 'flex', gap: 8, listStyle: 'none', margin: 0, padding: 0 };

	function link(href: string, text: string, closeOnClick = false) {
		return h(NavigationMenu.Link, { href, closeOnClick }, text);
	}

	function item(value: string, trigger: ReactNode, content: ReactNode) {
		return h(NavigationMenu.Item, { value }, trigger, content);
	}

	function content(testId: string, ...children: ReactNode[]) {
		return h(NavigationMenu.Content, partProps({ 'data-testid': testId }), ...children);
	}

	function nested() {
		return item(
			'product',
			h(NavigationMenu.Trigger, null, 'Product'),
			content(
				'product-content',
				h(
					NavigationMenu.Root,
					{ defaultValue: 'developers', orientation: 'vertical' },
					h(
						NavigationMenu.List,
						{ style: { listStyle: 'none', margin: 0, padding: 0 } },
						item(
							'developers',
							h(NavigationMenu.Trigger, null, 'Developers'),
							content('developers-content', link('#get-started', 'Get started'))
						),
						item(
							'design',
							h(NavigationMenu.Trigger, null, 'Design'),
							content('design-content', link('#design-guide', 'Design guide', true))
						)
					),
					h(NavigationMenu.Viewport, partProps({ 'data-testid': 'nested-viewport' }))
				)
			)
		);
	}

	function App() {
		const [value, setValue] = useState<string | null>(null);
		const [calls, setCalls] = useState<Call[]>([]);
		useEffect(onReady, []);

		function changed(next: unknown, details: { reason: string }) {
			setValue(next as string | null);
			setCalls((list) => list.concat({ value: next as string | null, reason: details.reason }));
		}

		return h(
			Fragment,
			null,
			h('button', { type: 'button', style: { position: 'fixed', right: 8, bottom: 8 } }, 'Outside'),
			scenario === 'bound'
				? h(
						Fragment,
						null,
						h(
							'button',
							{ type: 'button', 'data-testid': 'show', onClick: () => setValue('handbook') },
							'Show'
						),
						h(
							'button',
							{ type: 'button', 'data-testid': 'hide', onClick: () => setValue(null) },
							'Hide'
						)
					)
				: null,
			h('pre', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('pre', { 'data-testid': 'value' }, String(value)),
			h(
				'div',
				{ style: { margin: 40 } },
				h(
					NavigationMenu.Root,
					partProps({ value, onValueChange: changed, orientation, ...timing }),
					h(
						NavigationMenu.List,
						{ style: listStyle },
						item(
							'overview',
							h(
								NavigationMenu.Trigger,
								null,
								'Overview',
								h(NavigationMenu.Icon, partProps({ 'data-testid': 'overview-icon' }), 'v')
							),
							content(
								'overview-content',
								h(
									'div',
									{ style: { width: 400, height: 160 } },
									link('#quick-start', 'Quick Start', true),
									link('#accessibility', 'Accessibility')
								)
							)
						),
						item(
							'handbook',
							h(NavigationMenu.Trigger, null, 'Handbook'),
							content(
								'handbook-content',
								h(
									'div',
									{ style: { width: 300, height: 100 } },
									link('#styling', 'Styling'),
									link('#animation', 'Animation')
								)
							)
						),
						scenario === 'nested' ? nested() : null,
						h(NavigationMenu.Item, null, link('#github', 'GitHub'))
					),
					h(
						NavigationMenu.Portal,
						null,
						h(
							NavigationMenu.Positioner,
							partProps({ 'data-testid': 'positioner', sideOffset: 10 }),
							h(
								NavigationMenu.Popup,
								partProps({ 'data-testid': 'popup' }),
								h(NavigationMenu.Arrow, partProps({ 'data-testid': 'arrow' })),
								h(NavigationMenu.Viewport, partProps({ 'data-testid': 'viewport' }))
							)
						)
					)
				)
			)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
