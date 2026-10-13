<!--
	One menu built from an item tree, so one harness covers the ported Menu specs.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx and the Menu part tests
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DirectionProvider, Menu } from '#lib';
	import type { MenuFilterSpec, MenuItemSpec } from './types.js';

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
		opener = false,
		filter,
		list: listProps
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
		/** Makes the menu filterable. */
		filter?: MenuFilterSpec;
		/** Wraps a plain menu's items in `Menu.List`. */
		list?: Bag | boolean;
	} = $props();

	function bag(value: Bag | boolean | undefined) {
		return value === true || value === undefined || value === false ? {} : value;
	}

	const handle = Menu.createHandle();
	let root = $state<{ close(): void; unmount(): void }>();

	// Keyed by label, like React children that keep their element when an entry is inserted before.
	function keyOf(entries: MenuItemSpec[], index: number) {
		const label = (entry: MenuItemSpec) =>
			entry.type === 'item' && entry.key ? entry.key : 'label' in entry ? entry.label : entry.type;
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
			{#snippet submenu()}
				<Menu.SubmenuRoot {...entry.rootProps}>
					<Menu.SubmenuTrigger {...entry.triggerProps}>{entry.label}</Menu.SubmenuTrigger>
					<Menu.Portal {...entry.portalProps}>
						<Menu.Positioner {...entry.positionerProps}>
							<Menu.Popup {...entry.popupProps}>
								{@render content(entry.items, entry.filter, entry.list)}
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.SubmenuRoot>
			{/snippet}
			{@render filterable(entry.filter, submenu)}
		{/if}
	{/each}
{/snippet}

{#snippet content(
	entries: MenuItemSpec[],
	spec: MenuFilterSpec | undefined,
	plainList: Bag | boolean | undefined
)}
	{#if spec}
		<Menu.Input aria-label={spec.inputLabel ?? 'Filter actions'} {...spec.inputProps} />
		{#if spec.clear}<Menu.Clear aria-label="Clear filter" {...bag(spec.clear)} />{/if}
		{#if spec.extra}<button type="button">{spec.extra}</button>{/if}
		<Menu.List {...spec.listProps}>{@render list(entries)}</Menu.List>
		{#if spec.empty}<Menu.Empty>{spec.empty}</Menu.Empty>{/if}
	{:else if plainList}
		<Menu.List {...bag(plainList)}>{@render list(entries)}</Menu.List>
	{:else}
		{@render list(entries)}
	{/if}
{/snippet}

{#snippet filterable(spec: MenuFilterSpec | undefined, menu: Snippet)}
	{#if spec}
		<Menu.FilterProvider {...spec.providerProps}>{@render menu()}</Menu.FilterProvider>
	{:else}
		{@render menu()}
	{/if}
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
					<Menu.Viewport data-testid="viewport"
						>{@render content(items, filter, listProps)}</Menu.Viewport
					>
				{:else}
					{@render content(items, filter, listProps)}
				{/if}
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
{/snippet}

{#snippet menuRoot()}
	{#if bindOpen}
		<Menu.Root bind:this={root} bind:open handle={detached ? handle : undefined} {...rootProps}
			>{@render body()}</Menu.Root
		>
	{:else}
		<Menu.Root bind:this={root} {open} handle={detached ? handle : undefined} {...rootProps}
			>{@render body()}</Menu.Root
		>
	{/if}
{/snippet}

<DirectionProvider {direction}>
	{#if before}<button type="button">Before</button>{/if}
	{#if opener}<button type="button" onclick={() => (open = true)}>Show</button>{/if}
	{@render filterable(filter, menuRoot)}
	{#if detached}{@render triggerPart()}{/if}
	{#if after}<button type="button">After</button>{/if}
</DirectionProvider>
<button type="button">Outside</button>
