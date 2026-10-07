<script lang="ts">
	// Derived from Base UI v1.8.0 packages/react/src/utils/InternalBackdrop.tsx
	// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

	import type { HTMLAttributes } from 'svelte/elements';
	import { toCssStyle } from './css-style.js';

	let {
		cutout = null,
		style: _style,
		children: _children,
		...rest
	}: HTMLAttributes<HTMLDivElement> & { cutout?: Element | null } = $props();

	const clipPath = $derived.by(() => {
		if (!cutout) return undefined;
		const rect = cutout.getBoundingClientRect();
		return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${rect.left}px ${rect.top}px, ${rect.left}px ${rect.bottom}px, ${rect.right}px ${rect.bottom}px, ${rect.right}px ${rect.top}px, ${rect.left}px ${rect.top}px)`;
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
></div>
