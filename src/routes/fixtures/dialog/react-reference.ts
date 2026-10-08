// React Base UI 1.8.0 counterpart of DialogFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
import { Popover } from '@base-ui/react/popover';
import { noteOpen, type OpenCall } from '../open-change.js';
import type { DialogCase } from './cases.js';

export function mountDialogReference(node: HTMLElement, scenario: DialogCase, onReady: () => void) {
	function App() {
		const [calls, setCalls] = useState<OpenCall[]>([]);
		const [outerOpen, setOuterOpen] = useState(scenario !== 'nested-onto');
		const [innerOpen, setInnerOpen] = useState(true);
		const [parentOpen, setParentOpen] = useState(false);
		const [inlineContainer, setInlineContainer] = useState<HTMLDivElement | null>(null);
		useLayoutEffect(() => {
			if (scenario !== 'tab-inline') return;
			const node = document.querySelector<HTMLDivElement>('[data-testid="inline-container"]');
			setInlineContainer(node);
		}, [scenario]);
		useEffect(onReady, []);
		const changed = (
			open: boolean,
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) => setCalls((previous) => previous.concat(noteOpen(scenario, open, details)));
		const track =
			(setOpen: (next: boolean) => void) =>
			(open: boolean, details: { reason: string; isCanceled: boolean; cancel: () => void }) => {
				setOpen(open);
				changed(open, details);
			};

		const outsideRef = useRef<HTMLButtonElement>(null);
		const outside = h(
			'button',
			{ type: 'button', 'data-testid': 'outside', ref: outsideRef },
			'Outside'
		);
		const outsideInput = h('input', { 'data-testid': 'outside-input' });
		const callsNode = h('output', { 'data-testid': 'calls' }, JSON.stringify(calls));
		const finalRef = useRef<HTMLButtonElement>(null);
		const nestedInside = h(
			'button',
			{ type: 'button', 'data-testid': 'nested-inside' },
			'Nested inside'
		);

		function nestedChild(
			root: Record<string, unknown> | null,
			portal: Record<string, unknown> | null,
			popup: Record<string, unknown>,
			child: ReturnType<typeof h>
		) {
			return h(
				Dialog.Root,
				root,
				h(Dialog.Trigger, null, 'Nested'),
				h(
					Dialog.Portal,
					portal,
					h(
						Dialog.Popup,
						{ ...popup, 'data-testid': 'nested-popup' } as never,
						h(Dialog.Title, null, 'Nested title'),
						child
					)
				)
			);
		}

		function openParent(props: Record<string, unknown>, children: Array<ReturnType<typeof h>>) {
			return h(
				Dialog.Root,
				props,
				h(Dialog.Trigger, null, 'Open'),
				h(
					Dialog.Portal,
					null,
					h(Dialog.Popup, { 'data-testid': 'parent-popup' } as never, ...children)
				)
			);
		}

		if (scenario === 'kept-child') {
			return h(
				Fragment,
				null,
				outside,
				h(
					Dialog.Root,
					{ open: parentOpen, onOpenChange: setParentOpen },
					h(Dialog.Trigger, { 'data-testid': 'open-parent' } as never, 'Open'),
					h(
						Dialog.Portal,
						{ keepMounted: true },
						h(
							Dialog.Popup,
							{ 'data-testid': 'parent-popup' } as never,
							h(Dialog.Title, null, 'Title'),
							h('button', { type: 'button', 'data-testid': 'parent-inside' }, 'Inside'),
							nestedChild({ disablePointerDismissal: true }, null, {}, nestedInside)
						)
					)
				),
				h(
					'button',
					{ type: 'button', 'data-testid': 'force-close', onClick: () => setParentOpen(false) },
					'Force close'
				),
				callsNode
			);
		}

		if (scenario === 'nested-body') {
			return h(
				Fragment,
				null,
				outside,
				openParent({ modal: false, onOpenChange: changed }, [
					h(Dialog.Title, null, 'Title'),
					h('button', { type: 'button' }, 'Inside'),
					nestedChild({ modal: false }, { container: document.body }, {}, nestedInside)
				]),
				callsNode
			);
		}

		if (scenario === 'final-focus') {
			return h(
				Fragment,
				null,
				outside,
				h('button', { type: 'button', ref: finalRef, 'data-testid': 'final-target' }, 'Land here'),
				openParent({ modal: false, onOpenChange: changed }, [
					h(Dialog.Title, null, 'Title'),
					nestedChild(
						{ modal: false },
						null,
						{ finalFocus: finalRef },
						h(Dialog.Close, null, 'Nested close')
					)
				]),
				callsNode
			);
		}

		if (scenario === 'together-outside') {
			return h(
				Fragment,
				null,
				outside,
				outsideInput,
				h(
					Dialog.Root,
					{ modal: false, defaultOpen: true, onOpenChange: changed },
					h(Dialog.Trigger, null, 'Open'),
					h(
						Dialog.Portal,
						null,
						h(
							Dialog.Popup,
							{ 'data-testid': 'parent-popup' } as never,
							h(Dialog.Title, null, 'Title'),
							h('button', { type: 'button', 'data-testid': 'parent-inside' }, 'Inside'),
							h(
								Dialog.Root,
								{ modal: false, defaultOpen: true },
								h(Dialog.Trigger, null, 'Nested'),
								h(
									Dialog.Portal,
									null,
									h(
										Dialog.Popup,
										{
											'data-testid': 'nested-popup',
											finalFocus: outsideRef
										} as never,
										h(Dialog.Title, null, 'Nested title'),
										h('button', { type: 'button', 'data-testid': 'nested-inside' }, 'Nested inside')
									)
								)
							)
						)
					)
				),
				callsNode
			);
		}

		if (scenario === 'final-outside') {
			return h(
				Fragment,
				null,
				outside,
				openParent({ modal: false, onOpenChange: changed }, [
					h(Dialog.Title, null, 'Title'),
					h('button', { type: 'button', 'data-testid': 'parent-inside' }, 'Inside'),
					nestedChild(
						{ modal: false },
						null,
						{ finalFocus: outsideRef },
						h('button', { type: 'button', 'data-testid': 'nested-inside' }, 'Nested inside')
					)
				]),
				callsNode
			);
		}

		if (scenario === 'tab' || scenario === 'tab-inline') {
			return h(
				Fragment,
				null,
				outside,
				h('button', { type: 'button', 'data-testid': 'before' }, 'Before'),
				h(
					Dialog.Root,
					{ modal: false, onOpenChange: changed },
					h(Dialog.Trigger, null, 'Open'),
					h(
						Dialog.Portal,
						scenario === 'tab-inline' ? { container: inlineContainer } : null,
						h(
							Dialog.Popup,
							null,
							h(Dialog.Title, null, 'Title'),
							h('button', { type: 'button' }, 'Inside')
						)
					)
				),
				scenario === 'tab-inline' ? h('div', { 'data-testid': 'inline-container' }) : null,
				h('button', { type: 'button', 'data-testid': 'after' }, 'After'),
				callsNode
			);
		}

		if (scenario === 'child-initial') {
			return h(
				Fragment,
				null,
				outside,
				openParent({ onOpenChange: changed }, [
					h(Dialog.Title, null, 'Title'),
					h('button', { type: 'button', 'data-testid': 'parent-inside' }, 'Inside'),
					nestedChild(null, { container: document.body }, { initialFocus: false }, nestedInside)
				]),
				callsNode
			);
		}

		if (scenario === 'siblings') {
			return h(
				Fragment,
				null,
				outside,
				h(
					Dialog.Root,
					{ modal: false, defaultOpen: true },
					h(Dialog.Trigger, null, 'Open A'),
					h(
						Dialog.Portal,
						null,
						h(
							Dialog.Popup,
							{ 'data-testid': 'popup-a', initialFocus: false } as never,
							h(Dialog.Title, null, 'A'),
							h('button', { type: 'button', 'data-testid': 'inside-a' }, 'Inside A')
						)
					)
				),
				h(
					Dialog.Root,
					{ modal: false, defaultOpen: true },
					h(Dialog.Trigger, null, 'Open B'),
					h(
						Dialog.Portal,
						null,
						h(
							Dialog.Popup,
							{ 'data-testid': 'popup-b', initialFocus: false } as never,
							h(Dialog.Title, null, 'B'),
							h('button', { type: 'button', 'data-testid': 'inside-b' }, 'Inside B')
						)
					)
				),
				callsNode
			);
		}

		if (scenario === 'nested-open' || scenario === 'nested-onto' || scenario === 'nested-popover') {
			const nested =
				scenario === 'nested-popover'
					? h(
							Popover.Root,
							{
								open: innerOpen,
								onOpenChange: track(setInnerOpen)
							},
							h(Popover.Trigger, null, 'Nested'),
							h(
								Popover.Portal,
								null,
								h(
									Popover.Positioner,
									null,
									h(
										Popover.Popup,
										{ 'data-testid': 'nested-popup' } as never,
										h(Popover.Title, null, 'Nested title'),
										h('button', { type: 'button' }, 'Nested inside')
									)
								)
							)
						)
					: nestedChild(
							{ open: innerOpen, onOpenChange: track(setInnerOpen) },
							null,
							{},
							h('button', { type: 'button' }, 'Nested inside')
						);
			return h(
				Fragment,
				null,
				outside,
				h(
					Dialog.Root,
					{
						open: outerOpen,
						onOpenChange: track(setOuterOpen)
					},
					h(Dialog.Trigger, null, 'Open'),
					h(
						Dialog.Portal,
						null,
						h(
							Dialog.Popup,
							{ 'data-testid': 'popup' } as never,
							h(Dialog.Title, null, 'Title'),
							h('button', { type: 'button' }, 'Inside'),
							nested
						)
					)
				),
				callsNode
			);
		}

		if (scenario === 'nested') {
			return h(
				Fragment,
				null,
				outside,
				h(
					Dialog.Root,
					{ onOpenChange: changed },
					h(Dialog.Trigger, null, 'Open'),
					h(
						Dialog.Portal,
						null,
						h(
							Dialog.Popup,
							{ 'data-testid': 'popup' } as never,
							h(Dialog.Title, null, 'Title'),
							h(Dialog.Close, null, 'Close'),
							nestedChild(null, null, {}, h(Dialog.Close, null, 'Nested close'))
						)
					)
				),
				callsNode
			);
		}

		return h(
			Fragment,
			null,
			outside,
			outsideInput,
			h(
				Dialog.Root,
				{ modal: scenario === 'outside' ? false : true, onOpenChange: changed },
				h(
					Dialog.Trigger,
					{
						disabled: scenario === 'disabled'
					},
					'Open'
				),
				h(
					Dialog.Portal,
					null,
					scenario === 'outside' ? null : h(Dialog.Backdrop, null),
					h(
						Dialog.Popup,
						{ 'data-testid': 'popup' } as never,
						h(Dialog.Title, null, 'Title'),
						h(Dialog.Description, null, 'Description'),
						h('button', { type: 'button' }, 'Inside'),
						h(Dialog.Close, null, 'Close')
					)
				)
			),
			callsNode
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
