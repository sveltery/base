import { createElement as h, Fragment, useEffect, useState } from 'react';
import { MessageScroller } from '@shadcn/react/message-scroller';
import { mountApp, passProps } from '../react-fixture.js';
import { appended, initialMessages, type MessageScrollerCase } from './cases.js';

export function mountMessageScrollerReference(
	node: HTMLElement,
	scenario: MessageScrollerCase,
	onReady: () => void
) {
	function App() {
		useEffect(onReady, []);
		const [messages, setMessages] = useState(initialMessages[scenario]);
		return h(
			Fragment,
			null,
			h(
				MessageScroller.Provider,
				{
					autoScroll: scenario === 'auto-scroll',
					defaultScrollPosition:
						scenario === 'start' ? 'start' : scenario === 'last-anchor' ? 'last-anchor' : 'end'
				},
				h(
					MessageScroller.Root,
					passProps({ 'data-testid': 'root' }),
					h(
						MessageScroller.Viewport,
						passProps({ 'data-testid': 'viewport', style: { height: 100, overflowY: 'auto' } }),
						h(
							MessageScroller.Content,
							passProps({ 'data-testid': 'content' }),
							messages.map((message) =>
								h(
									MessageScroller.Item,
									{
										key: message.id,
										messageId: message.id,
										scrollAnchor: message.scrollAnchor,
										style: { height: message.height }
									},
									message.id
								)
							)
						)
					),
					h(
						MessageScroller.Button,
						passProps({ 'data-testid': 'start', direction: 'start', behavior: 'auto' })
					),
					h(MessageScroller.Button, passProps({ 'data-testid': 'end', behavior: 'auto' }))
				)
			),
			h(
				'button',
				{
					type: 'button',
					onClick: () => setMessages([...messages, ...appended(messages.length)])
				},
				'Append'
			)
		);
	}

	return mountApp(node, App);
}
