<script lang="ts">
	// Derived from Base UI v1.9.0 packages/react/src/utils/InternalBackdrop.tsx
	// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

	import { on } from 'svelte/events';
	import type { HTMLAttributes } from 'svelte/elements';
	import { toCssStyle } from './css-style.js';
	import { ownerWindow } from '@sveltery/utils';

	let {
		cutout = null,
		style: _style,
		children: _children,
		...rest
	}: HTMLAttributes<HTMLDivElement> & { cutout?: Element | null } = $props();

	let box = $state<{ left: number; top: number; right: number; bottom: number } | null>(null);

	function trackCutout(target: Element | null) {
		return (node: HTMLElement) => {
			const read = () => {
				if (!target) {
					box = null;
					return;
				}
				const next = target.getBoundingClientRect();
				box = { left: next.left, top: next.top, right: next.right, bottom: next.bottom };
			};
			const view = ownerWindow(node);
			let observer: ResizeObserver | undefined;
			if (target && typeof view.ResizeObserver === 'function') {
				observer = new view.ResizeObserver(read);
				observer.observe(target);
			}
			const stopScroll = on(view, 'scroll', read, { capture: true });
			read();
			return () => {
				observer?.disconnect();
				stopScroll();
			};
		};
	}

	const clipPath = $derived.by(() => {
		if (!cutout || !box) return undefined;
		return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${box.left}px ${box.top}px, ${box.left}px ${box.bottom}px, ${box.right}px ${box.bottom}px, ${box.right}px ${box.top}px, ${box.left}px ${box.top}px)`;
	});
</script>

<div
	{...rest}
	role="presentation"
	data-base-ui-inert=""
	style={toCssStyle({
		position: 'fixed',
		inset: 0,
		userSelect: 'none',
		WebkitUserSelect: 'none',
		clipPath
	})}
	{@attach trackCutout(cutout)}
></div>
