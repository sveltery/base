<script lang="ts" module>
	export interface HarnessItem {
		value: unknown;
		/** The rendered item text. Defaults to the value as a string. */
		text?: string;
		label?: string;
		disabled?: boolean;
		testid?: string;
	}

	export interface HarnessGroup {
		label: string;
		items: HarnessItem[];
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		Select,
		type SelectItemIndicatorProps,
		type SelectPopupProps,
		type SelectPortalProps,
		type SelectPositionerProps,
		type SelectRootProps,
		type SelectTriggerProps,
		type SelectValueProps
	} from '#lib';

	let {
		value = $bindable(),
		open = $bindable(false),
		root = {},
		items = [],
		groups,
		trigger = {},
		valueProps = {},
		formatValue,
		positioner = {},
		popup = {},
		portal = {},
		list = false,
		listProps = {},
		indicator = false,
		indicatorProps = {},
		scrollArrows = false,
		scrollArrowProps = {},
		arrow = false,
		backdrop = false,
		label,
		icon = false,
		separator = false,
		itemStyle,
		before,
		after
	}: {
		value?: unknown;
		open?: boolean;
		root?: Partial<SelectRootProps<unknown, boolean>>;
		items?: HarnessItem[];
		groups?: HarnessGroup[];
		trigger?: Partial<SelectTriggerProps> & Record<string, unknown>;
		valueProps?: Partial<SelectValueProps> & Record<string, unknown>;
		/** Renders `Select.Value` children with this formatter. */
		formatValue?: (value: unknown) => string;
		positioner?: Partial<SelectPositionerProps> & Record<string, unknown>;
		popup?: Partial<SelectPopupProps> & Record<string, unknown>;
		portal?: Partial<SelectPortalProps>;
		list?: boolean;
		listProps?: HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
		indicator?: boolean;
		indicatorProps?: Partial<SelectItemIndicatorProps> & Record<string, unknown>;
		scrollArrows?: boolean;
		scrollArrowProps?: Record<string, unknown>;
		arrow?: boolean;
		backdrop?: boolean;
		label?: string;
		icon?: boolean;
		separator?: boolean;
		itemStyle?: string;
		before?: Snippet;
		after?: Snippet;
	} = $props();

	const textOf = (item: HarnessItem) => item.text ?? String(item.value);

	let select = $state<{ close(): void; unmount(): void }>();

	export function close() {
		select?.close();
	}

	export function unmount() {
		select?.unmount();
	}
</script>

{#snippet item(entry: HarnessItem)}
	<Select.Item
		value={entry.value}
		label={entry.label}
		disabled={entry.disabled}
		data-testid={entry.testid}
		style={itemStyle}
	>
		{#if indicator}
			<Select.ItemIndicator {...indicatorProps} data-testid="indicator-{textOf(entry)}" />
		{/if}
		<Select.ItemText>{textOf(entry)}</Select.ItemText>
	</Select.Item>
{/snippet}

{#snippet entries()}
	{#if groups}
		{#each groups as group, index (group.label)}
			{#if separator && index > 0}<Select.Separator data-testid="separator" />{/if}
			<Select.Group data-testid="group-{group.label}">
				<Select.GroupLabel>{group.label}</Select.GroupLabel>
				{#each group.items as entry (entry.value)}
					{@render item(entry)}
				{/each}
			</Select.Group>
		{/each}
	{:else}
		{#each items as entry, index (index)}
			{#if separator && index > 0}<Select.Separator data-testid="separator" />{/if}
			{@render item(entry)}
		{/each}
	{/if}
{/snippet}

{#snippet positioned()}
	{#if backdrop}<Select.Backdrop data-testid="backdrop" />{/if}
	<Select.Positioner data-testid="positioner" {...positioner}>
		{#if scrollArrows}<Select.ScrollUpArrow data-testid="scroll-up" {...scrollArrowProps} />{/if}
		<Select.Popup data-testid="popup" {...popup}>
			{#if arrow}<Select.Arrow data-testid="arrow" />{/if}
			{#if list}
				<Select.List data-testid="list" {...listProps}>{@render entries()}</Select.List>
			{:else}
				{@render entries()}
			{/if}
		</Select.Popup>
		{#if scrollArrows}<Select.ScrollDownArrow data-testid="scroll-down" {...scrollArrowProps} />{/if}
	</Select.Positioner>
{/snippet}

{@render before?.()}
<Select.Root bind:this={select} bind:value bind:open {...root}>
	{#if label}<Select.Label data-testid="label">{label}</Select.Label>{/if}
	<Select.Trigger data-testid="trigger" {...trigger}>
		{#if formatValue}
			<Select.Value data-testid="value" {...valueProps}>
				{#snippet children(current)}{formatValue(current)}{/snippet}
			</Select.Value>
		{:else}
			<Select.Value data-testid="value" {...valueProps} />
		{/if}
		{#if icon}<Select.Icon data-testid="icon" />{/if}
	</Select.Trigger>
	<Select.Portal {...portal}>{@render positioned()}</Select.Portal>
</Select.Root>
{@render after?.()}
