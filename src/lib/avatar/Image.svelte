<!--
	The image shown in the avatar. Renders an `<img>`.
	Derived from Base UI v1.8.0 packages/react/src/avatar/image/AvatarImage.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { avatarStateAttributesMapping } from './attributes.js';
	import { useAvatarContext } from './context.js';
	import {
		createImageLoadingStatus,
		type ImageProbeSource
	} from './image-loading-status.svelte.js';
	import type { HTMLImgAttributes } from 'svelte/elements';
	import type { AvatarImageProps, AvatarImageState, ImageLoadingStatus } from './types.js';

	type ImageEvent = Parameters<NonNullable<HTMLImgAttributes['onload']>>[0];

	let {
		render,
		children: _children,
		keepMounted = false,
		onLoadingStatusChange,
		onload,
		onerror,
		sizes,
		srcset,
		src,
		crossorigin,
		referrerpolicy,
		...elementProps
	}: AvatarImageProps = $props();

	const root = useAvatarContext();
	const loading = createImageLoadingStatus(
		() => !keepMounted,
		() => ({ src, srcset, sizes, crossorigin, referrerpolicy })
	);
	const partState: AvatarImageState = $derived({ imageLoadingStatus: loading.status });

	let host = $state<HTMLImageElement | null>(null);
	const hostKey = createAttachmentKey();

	function attachHost(node: HTMLImageElement) {
		host = node;
		return () => {
			if (host === node) host = null;
		};
	}

	function readRenderedStatus(node: HTMLImageElement, source: ImageProbeSource) {
		if (!source.src && !source.srcset) {
			loading.setStatus('error');
			return;
		}
		if (!node.complete) {
			loading.setStatus('loading');
			return;
		}
		loading.setStatus(node.naturalWidth > 0 ? 'loaded' : 'error');
	}

	// The rendered element is the source of truth when `keepMounted` is set. The load event may
	// already have fired for a cached image, so the status is read from `complete` as well.
	$effect(() => {
		if (!keepMounted) return;
		const node = host;
		const source = { src, srcset, sizes, crossorigin, referrerpolicy };
		if (!node) return;
		readRenderedStatus(node, source);
	});

	function publish(status: ImageLoadingStatus) {
		untrack(() => onLoadingStatusChange?.(status));
		root.setImageLoadingStatus(status);
	}

	$effect(() => {
		const status = loading.status;
		if (status !== 'idle') publish(status);
	});

	$effect(() => {
		return () => root.setImageLoadingStatus('idle');
	});

	function handleLoad(event: ImageEvent) {
		onload?.(event);
		if (!keepMounted || event.defaultPrevented) return;
		loading.setStatus('loaded');
	}

	function handleError(event: ImageEvent) {
		onerror?.(event);
		if (!keepMounted || event.defaultPrevented) return;
		loading.setStatus('error');
	}

	const shown = $derived(keepMounted || loading.status === 'loaded');
	const sourceProps = $derived.by(() => {
		const source: Record<string, string> = {};
		if (sizes != null) source.sizes = sizes;
		if (srcset != null) source.srcset = srcset;
		if (src != null) source.src = src;
		return source;
	});
	const statusProps = $derived(
		keepMounted
			? {
					'data-loading': loading.status === 'loading' ? '' : undefined,
					'data-error': loading.status === 'error' ? '' : undefined,
					'aria-hidden': loading.status !== 'loaded' ? true : undefined
				}
			: {}
	);
	const hostProps = $derived({
		...getStateAttributesProps(partState, avatarStateAttributesMapping),
		...statusProps,
		...elementProps,
		...(crossorigin !== undefined ? { crossorigin } : {}),
		...(referrerpolicy !== undefined ? { referrerpolicy } : {}),
		...sourceProps,
		onload: handleLoad,
		onerror: handleError,
		...(keepMounted ? { [hostKey]: attachHost } : {})
	});
</script>

{#if shown}
	{#if render}
		{@render render(hostProps, partState)}
	{:else}
		<img {...hostProps} />
	{/if}
{/if}
