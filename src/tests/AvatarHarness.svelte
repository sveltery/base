<script lang="ts">
	import { untrack } from 'svelte';
	import { Avatar, type ImageLoadingStatus } from '#lib';
	import type { HTMLImgAttributes } from 'svelte/elements';

	let {
		mode = 'parts',
		src,
		srcset,
		sizes,
		alt,
		crossorigin,
		referrerpolicy,
		loading,
		keepMounted = false,
		delay = 0,
		controls = false,
		custom = false,
		ariaHidden,
		box,
		onLoadingStatusChange,
		onload,
		onerror
	}: {
		mode?: 'parts' | 'srcset' | 'keep' | 'delay' | 'unmount' | 'two' | 'keys' | 'attach' | 'root';
		src?: string;
		srcset?: string;
		sizes?: string;
		alt?: string;
		crossorigin?: HTMLImgAttributes['crossorigin'];
		referrerpolicy?: HTMLImgAttributes['referrerpolicy'];
		loading?: HTMLImgAttributes['loading'];
		keepMounted?: boolean;
		delay?: number;
		controls?: boolean;
		custom?: boolean;
		ariaHidden?: boolean;
		box?: { keys: string[] };
		onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
		onload?: (event: Event) => void;
		onerror?: (event: Event) => void;
	} = $props();

	let showImage = $state(true);
	let delayValue = $state(untrack(() => delay));
	let srcValue = $state(untrack(() => src));
	let hostLabel = $state('none');

	function capture(node: HTMLElement) {
		hostLabel = node.className;
		return () => {
			hostLabel = 'none';
		};
	}

	function record(props: HTMLImgAttributes) {
		if (box) box.keys = Object.keys(props);
		return props;
	}
</script>

{#if mode === 'srcset'}
	<Avatar.Root data-testid="root">
		<Avatar.Image data-testid="image" sizes="48px" srcset="avatar.png 1x" />
		<Avatar.Fallback data-testid="fallback">JD</Avatar.Fallback>
	</Avatar.Root>
{:else if mode === 'keep'}
	<Avatar.Root data-testid="root">
		<Avatar.Image
			alt="Jane Doe"
			data-testid="image"
			keepMounted
			src={srcValue}
			{onLoadingStatusChange}
			{onload}
			{onerror}
			{...ariaHidden === undefined ? {} : { 'aria-hidden': ariaHidden }}
		/>
		<Avatar.Fallback data-testid="fallback">JD</Avatar.Fallback>
	</Avatar.Root>
	{#if controls}
		<button type="button" onclick={() => (srcValue = '/swapped-avatar.png')}>Swap source</button>
	{/if}
{:else if mode === 'delay'}
	<Avatar.Root data-testid="root">
		<Avatar.Image />
		<Avatar.Fallback data-testid="fallback" delay={delayValue}>JD</Avatar.Fallback>
	</Avatar.Root>
	{#if controls}
		<button type="button" onclick={() => (delayValue = 0)}>Set delay 0</button>
		<button type="button" onclick={() => (delayValue = 800)}>Set delay 800</button>
	{/if}
{:else if mode === 'unmount'}
	<Avatar.Root data-testid="root">
		{#if showImage}
			<Avatar.Image alt="Jane Doe" data-testid="image" src={srcValue} />
		{/if}
		<Avatar.Fallback data-testid="fallback">JD</Avatar.Fallback>
	</Avatar.Root>
	<button type="button" onclick={() => (showImage = false)}>Hide image</button>
{:else if mode === 'two'}
	<Avatar.Root data-testid="root">
		{#if showImage}
			<Avatar.Image alt="One" data-testid="one" src={srcValue} />
		{/if}
		<Avatar.Image alt="Two" data-testid="two" src={srcValue} />
		<Avatar.Fallback data-testid="fallback">JD</Avatar.Fallback>
	</Avatar.Root>
	<button type="button" onclick={() => (showImage = false)}>Drop first</button>
{:else if mode === 'keys'}
	<Avatar.Root>
		<Avatar.Image keepMounted {loading} {sizes} src={srcValue} {srcset} {onLoadingStatusChange}>
			{#snippet render(props)}
				<img alt="" {...record(props)} data-testid="image" />
			{/snippet}
		</Avatar.Image>
		<Avatar.Fallback data-testid="fallback">JD</Avatar.Fallback>
	</Avatar.Root>
{:else if mode === 'attach'}
	<Avatar.Root>
		{#if custom}
			<Avatar.Image class="custom-host" keepMounted src={srcValue} {@attach capture}>
				{#snippet render(props, state)}
					<img {...props} alt="" data-status={state.imageLoadingStatus} data-testid="image" />
				{/snippet}
			</Avatar.Image>
		{:else}
			<Avatar.Image class="default-host" keepMounted src={srcValue} {@attach capture} />
		{/if}
	</Avatar.Root>
	<output data-testid="host">{hostLabel}</output>
{:else if mode === 'root'}
	<Avatar.Root class="avatar-root">
		{#snippet render(props, state)}
			<div {...props} data-status={state.imageLoadingStatus} data-testid="root">Root</div>
		{/snippet}
	</Avatar.Root>
{:else}
	<Avatar.Root data-testid="root">
		<Avatar.Image
			{alt}
			data-testid="image"
			{keepMounted}
			{loading}
			{sizes}
			src={srcValue}
			{srcset}
			{crossorigin}
			{referrerpolicy}
			{onLoadingStatusChange}
			{onload}
			{onerror}
		/>
		<Avatar.Fallback data-testid="fallback" delay={delayValue}>JD</Avatar.Fallback>
	</Avatar.Root>
{/if}
