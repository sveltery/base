<!--
	Rendered when the image is not loaded. Renders a `<span>`.
	Derived from Base UI v1.8.0 packages/react/src/avatar/fallback/AvatarFallback.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { avatarStateAttributesMapping } from './attributes.js';
	import { useAvatarContext } from './context.js';
	import type { AvatarFallbackProps, AvatarFallbackState } from './types.js';

	let { render, delay = 0, children, ...elementProps }: AvatarFallbackProps = $props();

	const root = useAvatarContext();
	// `delay === 0` is visible on the first render, including SSR, before the effect runs.
	let delayPassed = $state(untrack(() => delay === 0));
	const partState: AvatarFallbackState = $derived({
		imageLoadingStatus: root.imageLoadingStatus
	});
	const visible = $derived(
		partState.imageLoadingStatus !== 'loaded' && (delay === 0 || delayPassed)
	);

	$effect(() => {
		if (delay > 0) {
			const timeout = setTimeout(() => {
				delayPassed = true;
			}, delay);
			return () => clearTimeout(timeout);
		}
		// A fallback that has already been shown stays shown if `delay` later becomes positive.
		delayPassed = true;
	});

	const hostProps = $derived({
		...elementProps,
		...getStateAttributesProps(partState, avatarStateAttributesMapping)
	});
</script>

{#if visible}
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<span {...hostProps}>{@render children?.()}</span>
	{/if}
{/if}
