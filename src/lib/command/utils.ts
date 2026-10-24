// Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
// MIT, see THIRD_PARTY_NOTICES.md.

import type { Attachment } from 'svelte/attachments';
import { AnimationFrame } from '@sveltery/utils';
import { CommandListCssVars } from './data-attributes.js';

export const VISUALLY_HIDDEN_STYLE =
	'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0';

export const cmdk = {
	root: { 'cmdk-root': '' },
	label: { 'cmdk-label': '' },
	input: { 'cmdk-input': '' },
	list: { 'cmdk-list': '' },
	listSizer: { 'cmdk-list-sizer': '' },
	group: { 'cmdk-group': '' },
	groupHeading: { 'cmdk-group-heading': '' },
	groupItems: { 'cmdk-group-items': '' },
	item: { 'cmdk-item': '' },
	separator: { 'cmdk-separator': '' },
	empty: { 'cmdk-empty': '' },
	loading: { 'cmdk-loading': '' }
} as const;

export const trackListHeight: Attachment<HTMLElement> = (sizer) => {
	const list = sizer.parentElement;
	if (!list || typeof ResizeObserver === 'undefined') return;
	// eslint-disable-next-line sveltery/no-unscoped-timer -- the returned cleanup cancels it
	const frame = new AnimationFrame();
	const observer = new ResizeObserver(() => {
		frame.request(() =>
			list.style.setProperty(CommandListCssVars.listHeight, `${sizer.offsetHeight.toFixed(1)}px`)
		);
	});
	observer.observe(sizer);
	return () => {
		frame.cancel();
		observer.disconnect();
	};
};
