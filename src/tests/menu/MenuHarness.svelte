<script lang="ts">
	import { DirectionProvider, Menu } from '#lib';
	import type { MenuItemSpec } from './types.js';

	type Bag = Record<string, unknown>;

	let {
		items = [],
		rootProps = {},
		trigger = {},
		triggerLabel = 'Open',
		triggerAs = 'button',
		portalProps = {},
		positionerProps = {},
		popupProps = {},
		backdrop = false,
		arrow = false,
		viewport = false,
		before = false,
		after = false,
		open = $bindable(),
		bindOpen = false,
		detached = false,
		direction = 'ltr',
		opener = false
	}: {
		items?: MenuItemSpec[];
		rootProps?: Bag;
		trigger?: Bag | false;
		triggerLabel?: string;
		triggerAs?: 'button' | 'span';
		portalProps?: Bag;
		positionerProps?: Bag;
		popupProps?: Bag;
		backdrop?: Bag | boolean;
		arrow?: boolean;
		viewport?: boolean;
		before?: boolean;
		after?: boolean;
		open?: boolean;
		bindOpen?: boolean;
		/** Renders the trigger after the root, connected through a handle. */
		detached?: boolean;
		direction?: 'ltr' | 'rtl';
		/** Renders a "Show" button that opens the bound menu. */
		opener?: boolean;
	} = $props();

	const handle = Menu.createHandle();
	let root = $state<{ close(): void; unmount(): void }>();

	// Keyed by label, like React children that keep their element when an entry is inserted before.
	function keyOf(entries: MenuItemSpec[], index: number) {
		const label = (entry: MenuItemSpec) => ('label' in entry ? entry.label : entry.type);
		const own = label(entries[index]);
		const seen = entries.slice(0, index).filter((entry) => label(entry) === own).length;
		return `${own}#${seen}`;
	}

	/** The imperative `close` and `unmount` of the rendered `Menu.Root`. */
	export function actions() {
		return root!;
	}
</script>

{#snippet list(entries: MenuItemSpec[])}
	{#each entries as entry, index (keyOf(entries, index))}
		{#if entry.type === 'item'}
			{#if entry.as === 'button'}
				<Menu.Item nativeButton {...entry.props}>
					{#snippet render(props)}
						<button type="button" {...props as Bag} {...entry.props?.buttonProps as Bag}
							>{entry.label}</button
						>
					{/snippet}
				</Menu.Item>
			{:else}
				<Menu.Item {...entry.props}>{entry.label}</Menu.Item>
			{/if}
		{:else if entry.type === 'link'}
			<Menu.LinkItem {...entry.props}>{entry.label}</Menu.LinkItem>
		{:else if entry.type === 'checkbox'}
			<Menu.CheckboxItem {...entry.props}>
				{#if entry.indicator}<Menu.CheckboxItemIndicator {...entry.indicator} />{/if}
				{entry.label}
			</Menu.CheckboxItem>
		{:else if entry.type === 'radio-group'}
			<Menu.RadioGroup {...entry.props}>
				{#if entry.groupLabel}<Menu.GroupLabel>{entry.groupLabel}</Menu.GroupLabel>{/if}
				{#each entry.items as radio (radio.label)}
					<Menu.RadioItem value={radio.value} {...radio.props}>
						{#if radio.indicator}<Menu.RadioItemIndicator {...radio.indicator} />{/if}
						{radio.label}
					</Menu.RadioItem>
				{/each}
			</Menu.RadioGroup>
		{:else if entry.type === 'group'}
			<Menu.Group {...entry.props}>
				{#if entry.groupLabel}<Menu.GroupLabel>{entry.groupLabel}</Menu.GroupLabel>{/if}
				{@render list(entry.items)}
			</Menu.Group>
		{:else if entry.type === 'separator'}
			<Menu.Separator />
		{:else if entry.type === 'button'}
			<button type="button">{entry.label}</button>
		{:else if entry.type === 'submenu'}
			<Menu.SubmenuRoot {...entry.rootProps}>
				<Menu.SubmenuTrigger {...entry.triggerProps}>{entry.label}</Menu.SubmenuTrigger>
				<Menu.Portal {...entry.portalProps}>
					<Menu.Positioner {...entry.positionerProps}>
						<Menu.Popup {...entry.popupProps}>
							{@render list(entry.items)}
						</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.SubmenuRoot>
		{/if}
	{/each}
{/snippet}

{#snippet triggerPart()}
	{#if trigger}
		{#if triggerAs === 'span'}
			<Menu.Trigger nativeButton={false} {...trigger}>
				{#snippet render(props)}
					<span {...props as Bag}>{triggerLabel}</span>
				{/snippet}
			</Menu.Trigger>
		{:else}
			<Menu.Trigger handle={detached ? handle : undefined} {...trigger}>{triggerLabel}</Menu.Trigger
			>
		{/if}
	{/if}
{/snippet}

{#snippet body()}
	{#if !detached}{@render triggerPart()}{/if}
	<Menu.Portal {...portalProps}>
		{#if backdrop}<Menu.Backdrop {...backdrop === true ? {} : backdrop} />{/if}
		<Menu.Positioner {...positionerProps}>
			<Menu.Popup {...popupProps}>
				{#if arrow}<Menu.Arrow data-testid="arrow" />{/if}
				{#if viewport}
					<Menu.Viewport data-testid="viewport">{@render list(items)}</Menu.Viewport>
				{:else}
					{@render list(items)}
				{/if}
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
{/snippet}

<DirectionProvider {direction}>
	{#if before}<button type="button">Before</button>{/if}
	{#if opener}<button type="button" onclick={() => (open = true)}>Show</button>{/if}
	{#if bindOpen}
		<Menu.Root bind:this={root} bind:open handle={detached ? handle : undefined} {...rootProps}
			>{@render body()}</Menu.Root
		>
	{:else}
		<Menu.Root bind:this={root} {open} handle={detached ? handle : undefined} {...rootProps}
			>{@render body()}</Menu.Root
		>
	{/if}
	{#if detached}{@render triggerPart()}{/if}
	{#if after}<button type="button">After</button>{/if}
</DirectionProvider>
<button type="button">Outside</button>
