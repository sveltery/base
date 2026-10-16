<!--
	The image to be displayed in the avatar.
	Renders an `<img>` element.
	Derived from Base UI v1.8.0 packages/react/src/avatar/image/AvatarImage.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import {
		getStateAttributesProps,
		transitionStatusMapping
	} from '../internal/state-attributes.js';
	import { chain } from '../internal/mergeProps.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import { avatarStateAttributesMapping } from './attributes.js';
	import { useAvatarContext } from './context.js';
	import { ImageProbe, type ImageProbeSource } from './image-loading-status.svelte.js';
	import type { AvatarImageProps, AvatarImageState, ImageLoadingStatus } from './types.js';

	let {
		render,
		children,
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
	const loading = new ImageProbe(
		() => !keepMounted,
		() => ({ src, srcset, sizes, crossorigin, referrerpolicy })
	);
	const visible = $derived(loading.status === 'loaded');
	const transition = new TransitionStatus(() => visible);
	const partState: AvatarImageState = $derived({
		imageLoadingStatus: loading.status,
		// With `keepMounted` the element never unmounts, so an exit phase would only flash.
		transitionStatus:
			keepMounted && transition.transitionStatus === 'ending'
				? undefined
				: transition.transitionStatus
	});

	let host = $state<HTMLImageElement | null>(null);
	const hostKey = createAttachmentKey();
	transition.unmountAfterExit(() => host);

	function attachHost(node: HTMLImageElement) {
		host = node;
		return () => {
			if (host === node) host = null;
		};
	}

	function readRenderedStatus(node: HTMLImageElement, source: ImageProbeSource) {
		if (!source.src && !source.srcset) {
			loading.status = 'error';
			return;
		}
		if (!node.complete) {
			loading.status = 'loading';
			return;
		}
		loading.status = node.naturalWidth > 0 ? 'loaded' : 'error';
	}

	let initialCommit = true;

	// The rendered element is the source of truth when `keepMounted` is set. The load event may
	// already have fired for a cached image, so the status is read from `complete` as well.
	$effect(() => {
		if (!keepMounted) return;
		const node = host;
		const source = { src, srcset, sizes, crossorigin, referrerpolicy };
		const firstRun = initialCommit;
		initialCommit = false;
		if (!node) return;
		readRenderedStatus(node, source);
		// An image already loaded before hydration was painted, so it skips the enter phase.
		if (firstRun && untrack(() => loading.status) === 'loaded') transition.setMounted(true);
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

	function settle(status: ImageLoadingStatus) {
		if (keepMounted) loading.status = status;
	}

	const shown = $derived(keepMounted || transition.mounted);
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
		...getStateAttributesProps(partState, {
			...avatarStateAttributesMapping,
			...transitionStatusMapping
		}),
		...statusProps,
		...elementProps,
		...(crossorigin !== undefined ? { crossorigin } : {}),
		...(referrerpolicy !== undefined ? { referrerpolicy } : {}),
		...sourceProps,
		onload: chain(() => settle('loaded'), onload),
		onerror: chain(() => settle('error'), onerror),
		[hostKey]: attachHost
	});
</script>

{#if shown}
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<img {...hostProps} />
	{/if}
{/if}
