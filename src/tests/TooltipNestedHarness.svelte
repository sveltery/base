<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		Tooltip,
		type TooltipProviderProps,
		type TooltipRootProps,
		type TooltipTriggerHostProps,
		type TooltipTriggerProps
	} from '#lib';

	let {
		layout = 'single',
		provider,
		outerRoot = {},
		outerBound = false,
		outer = {},
		inner = {},
		outerTag = 'span',
		outerTabIndex,
		area = false,
		after = false,
		innerTag = 'button',
		innerPopup = true
	}: {
		layout?: 'single' | 'siblings' | 'three-level' | 'detached';
		provider?: TooltipProviderProps;
		outerRoot?: TooltipRootProps;
		/** Shares the outer `open` and renders an `open-outer` button that sets it. */
		outerBound?: boolean;
		outer?: TooltipTriggerProps;
		inner?: TooltipTriggerProps;
		outerTag?: 'span' | 'div';
		outerTabIndex?: number;
		/** Wraps the outer label in a `data-testid="outer-area"` span. */
		area?: boolean;
		/** Adds a `data-testid="after"` button inside the outer trigger. */
		after?: boolean;
		innerTag?: 'button' | 'div';
		innerPopup?: boolean;
	} = $props();

	let outerOpen = $state(false);
	const rowHandle = Tooltip.createHandle<string>();
</script>

{#snippet outerElement(
	props: TooltipTriggerHostProps,
	_state: unknown,
	children: Snippet | undefined
)}
	{@const attributes = props as HTMLAttributes<HTMLElement>}
	<!-- Upstream renders the outer trigger as a focusable span to test focus opens. -->
	{#if outerTag === 'div'}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div {...attributes} tabindex={outerTabIndex}>{@render children?.()}</div>
	{:else}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<span {...attributes} tabindex={outerTabIndex}>{@render children?.()}</span>
	{/if}
{/snippet}

{#snippet innerElement(
	props: TooltipTriggerHostProps,
	_state: unknown,
	children: Snippet | undefined
)}
	<div {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</div>
{/snippet}

{#snippet leaf(name: string, label: string, props: TooltipTriggerProps)}
	<Tooltip.Root>
		<Tooltip.Trigger
			data-testid="{name}-trigger"
			render={innerTag === 'div' ? innerElement : undefined}
			{...props}
		>
			{label}
		</Tooltip.Trigger>
		{#if innerPopup}
			<Tooltip.Portal>
				<Tooltip.Positioner>
					<Tooltip.Popup data-testid="{name}-popup">{label} tooltip</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		{/if}
	</Tooltip.Root>
{/snippet}

{#snippet portal(name: string, text: string)}
	<Tooltip.Portal>
		<Tooltip.Positioner>
			<Tooltip.Popup data-testid="{name}-popup">{text}</Tooltip.Popup>
		</Tooltip.Positioner>
	</Tooltip.Portal>
{/snippet}

{#snippet outerContent()}
	{#if area}<span data-testid="outer-area">Outer</span>{:else}Outer{/if}
	{#if layout === 'siblings'}
		{@render leaf('inner-a', 'Inner A', inner)}
		{@render leaf('inner-b', 'Inner B', inner)}
	{:else if layout === 'three-level'}
		<Tooltip.Root>
			<Tooltip.Trigger data-testid="parent-trigger" render={outerElement}>
				Parent
				{@render leaf('child', 'Child', inner)}
			</Tooltip.Trigger>
			{@render portal('parent', 'Parent tooltip')}
		</Tooltip.Root>
	{:else}
		{@render leaf('inner', 'Inner', inner)}
	{/if}
	{#if after}<button data-testid="after">button</button>{/if}
{/snippet}

{#snippet tree()}
	{#if layout === 'detached'}
		<Tooltip.Trigger
			handle={rowHandle}
			payload="Row"
			data-testid="outer-trigger"
			render={outerElement}
			{...outer}
		>
			{@render outerContent()}
		</Tooltip.Trigger>
		<Tooltip.Root handle={rowHandle}>
			{#snippet children({ payload })}
				{@render portal('outer', `${payload} tooltip`)}
			{/snippet}
		</Tooltip.Root>
	{:else if outerBound}
		<button data-testid="open-outer" type="button" onclick={() => (outerOpen = true)}
			>Open outer</button
		>
		<Tooltip.Root {...outerRoot} bind:open={outerOpen}>
			<Tooltip.Trigger data-testid="outer-trigger" render={outerElement} {...outer}>
				{@render outerContent()}
			</Tooltip.Trigger>
			{@render portal('outer', 'Outer tooltip')}
		</Tooltip.Root>
	{:else}
		<Tooltip.Root {...outerRoot}>
			<Tooltip.Trigger data-testid="outer-trigger" render={outerElement} {...outer}>
				{@render outerContent()}
			</Tooltip.Trigger>
			{@render portal('outer', 'Outer tooltip')}
		</Tooltip.Root>
	{/if}
{/snippet}

{#if provider}
	<Tooltip.Provider {...provider}>{@render tree()}</Tooltip.Provider>
{:else}
	{@render tree()}
{/if}
