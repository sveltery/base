// React Base UI 1.8.0 counterpart of AvatarFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Avatar } from '@base-ui/react/avatar';
import type { AvatarCase } from './cases.js';

const TRANSPARENT =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export function mountAvatarReference(node: HTMLElement, scenario: AvatarCase, onReady: () => void) {
	function App() {
		const [calls, setCalls] = useState<string[]>([]);
		useEffect(onReady, []);
		const src =
			scenario === 'loaded' || scenario === 'keep'
				? TRANSPARENT
				: scenario === 'prevented'
					? '/hung-avatar.png'
					: '/missing-avatar.png';
		return h(
			Avatar.Root,
			null,
			h(Avatar.Image, {
				id: 'tested-image',
				alt: 'Jane Doe',
				src,
				keepMounted: scenario === 'keep' || scenario === 'prevented',
				// Base UI ignores preventDefault on its synthetic media events.
				onError: (event: { preventBaseUIHandler: () => void }) => {
					if (scenario === 'prevented') event.preventBaseUIHandler();
				},
				onLoadingStatusChange: (status: string) => {
					setCalls((previous) => [...previous, status]);
				}
			}),
			h(Avatar.Fallback, { id: 'tested-fallback', delay: scenario === 'delay' ? 1000 : 0 }, 'JD'),
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls))
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
