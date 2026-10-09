<script lang="ts">
	import {
		DirectionProvider,
		ScrollArea,
		ScrollAreaContent,
		ScrollAreaThumb,
		ScrollAreaViewport
	} from '#lib';

	let {
		scenario = 'both'
	}: {
		scenario?:
			| 'both'
			| 'rtl'
			| 'none'
			| 'threshold'
			| 'direction'
			| 'delayed'
			| 'shrink'
			| 'padded'
			| 'keep'
			| 'custom'
			| 'prevent'
			| 'snap'
			| 'paint'
			| 'orphan-viewport'
			| 'orphan-content'
			| 'orphan-thumb';
	} = $props();

	let show = $state(false);
	let large = $state(true);
	let threshold = $state(0);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let paint = $state(false);

	const rtl = $derived(scenario === 'rtl' || (scenario === 'direction' && direction === 'rtl'));
	// pointer-events: none keeps parallel browser tests from hit-testing this
	// tree. Dispatched events still run the part handlers.
	const rootStyle = $derived(
		`width: 200px; height: 200px; pointer-events: none${rtl ? '; direction: rtl' : ''}`
	);
	const contentStyle = $derived(
		large ? 'width: 1000px; height: 1000px' : 'width: 100px; height: 100px'
	);
	const viewportStyle = $derived(
		`width: 100%; height: 100%${scenario === 'snap' ? '; scroll-snap-type: y mandatory' : ''}${paint ? '; outline: 1px solid transparent' : ''}`
	);
	const thumbStyle = $derived(paint ? 'opacity: 0.99' : undefined);
</script>

<DirectionProvider direction={rtl ? 'rtl' : 'ltr'}>
	{#if scenario === 'orphan-viewport'}
		<ScrollAreaViewport />
	{:else if scenario === 'orphan-content'}
		<ScrollArea.Root>
			<ScrollAreaContent />
		</ScrollArea.Root>
	{:else if scenario === 'orphan-thumb'}
		<ScrollArea.Root>
			<ScrollAreaThumb />
		</ScrollArea.Root>
	{:else}
		{#if scenario === 'threshold'}
			<button type="button" onclick={() => (threshold = 1000)}>Raise threshold</button>
		{/if}
		{#if scenario === 'direction'}
			<button type="button" onclick={() => (direction = direction === 'ltr' ? 'rtl' : 'ltr')}>
				Flip direction
			</button>
		{/if}
		{#if scenario === 'delayed'}
			<button type="button" onclick={() => (show = true)}>Show content</button>
		{/if}
		{#if scenario === 'shrink'}
			<button type="button" onclick={() => (large = false)}>Shrink</button>
		{/if}
		{#if scenario === 'paint'}
			<button type="button" onclick={() => (paint = true)}>Paint</button>
		{/if}
		{#snippet parts()}
			<ScrollArea.Viewport data-testid="viewport" style={viewportStyle}>
				{#if scenario === 'delayed'}
					{#if show}
						<ScrollArea.Content data-testid="content">
							<div style={contentStyle}></div>
						</ScrollArea.Content>
					{/if}
				{:else if scenario === 'none' || scenario === 'keep'}
					<div style="width: 40px; height: 40px"></div>
				{:else}
					<ScrollArea.Content data-testid="content">
						<div style={contentStyle}></div>
					</ScrollArea.Content>
				{/if}
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar
				orientation="vertical"
				data-testid="scrollbar-y"
				keepMounted={scenario === 'keep'}
				style={scenario === 'padded' ? 'padding-block: 8px' : undefined}
				onpointerdown={(event) => {
					if (scenario === 'prevent') event.preventBaseUIHandler?.();
				}}
			>
				<ScrollArea.Thumb
					data-testid="thumb-y"
					style={scenario === 'paint' ? thumbStyle : undefined}
				/>
			</ScrollArea.Scrollbar>
			<ScrollArea.Scrollbar
				orientation="horizontal"
				data-testid="scrollbar-x"
				keepMounted={scenario === 'keep'}
				style={scenario === 'padded' ? 'padding-inline: 8px' : undefined}
			>
				<ScrollArea.Thumb data-testid="thumb-x" />
			</ScrollArea.Scrollbar>
			<ScrollArea.Corner data-testid="corner" />
		{/snippet}
		{#if scenario === 'custom'}
			<ScrollArea.Root data-testid="root" style={rootStyle}>
				{#snippet render(props, partState, rootChildren)}
					<div
						{...props}
						data-rendered="true"
						data-overflow={partState.hasOverflowY ? 'yes' : 'no'}
					>
						{@render rootChildren?.()}
					</div>
				{/snippet}
				{@render parts()}
			</ScrollArea.Root>
		{:else}
			<ScrollArea.Root
				data-testid="root"
				style={rootStyle}
				overflowEdgeThreshold={scenario === 'threshold' ? threshold : undefined}
			>
				{@render parts()}
			</ScrollArea.Root>
		{/if}
	{/if}
</DirectionProvider>
