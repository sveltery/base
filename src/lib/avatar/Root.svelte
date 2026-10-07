<!--
	Displays a user's profile picture, initials, or fallback icon. Renders a `<span>`.
	Derived from Base UI v1.8.0 packages/react/src/avatar/root/AvatarRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { avatarStateAttributesMapping } from './attributes.js';
	import { setAvatarContext } from './context.js';
	import type { AvatarRootProps, AvatarRootState, ImageLoadingStatus } from './types.js';

	let { render, children, ...elementProps }: AvatarRootProps = $props();

	let imageLoadingStatus = $state<ImageLoadingStatus>('idle');
	const partState: AvatarRootState = $derived({ imageLoadingStatus });

	setAvatarContext({
		get imageLoadingStatus() {
			return imageLoadingStatus;
		},
		setImageLoadingStatus(status) {
			imageLoadingStatus = status;
		}
	});

	const hostProps = $derived({
		...elementProps,
		...getStateAttributesProps(partState, avatarStateAttributesMapping)
	});
</script>

{#if render}
	{@render render(hostProps, partState)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
