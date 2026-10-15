<!--
	The fixture of upstream test/detachedTriggersConformanceTests.tsx for Menu: numbered triggers
	with payloads, contained in the root or detached through a handle.
	Derived from Base UI v1.9.0 packages/react/test/detachedTriggersConformanceTests.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu, type MenuHandle, type MenuPopupState } from '#lib';

	type Bag = Record<string, unknown>;

	let {
		mode = 'detached',
		handle,
		triggerCount = 2,
		triggerProps = {},
		rootProps = {},
		rootMounted = true,
		rootFirst = false,
		nesting = 0,
		positionerProps = {},
		popupProps = {},
		withViewport = false,
		bindOpen = false,
		open = $bindable(),
		triggerId = $bindable(),
		onPopupState,
		css = ''
	}: {
		mode?: 'contained' | 'detached';
		handle?: MenuHandle<number>;
		triggerCount?: number;
		triggerProps?: Bag | ((number: number) => Bag);
		rootProps?: Bag;
		rootMounted?: boolean;
		rootFirst?: boolean;
		/** Wrapper elements around the triggers. */
		nesting?: number;
		positionerProps?: Bag;
		popupProps?: Bag;
		withViewport?: boolean;
		/** Binds `open` and `triggerId` to the root. */
		bindOpen?: boolean;
		open?: boolean;
		triggerId?: string | null;
		/** Called with the popup state on every popup render. */
		onPopupState?: (state: MenuPopupState) => void;
		css?: string;
	} = $props();

	const detached = $derived(mode === 'detached');
	const numbers = $derived(Array.from({ length: triggerCount }, (_, index) => index + 1));

	function propsFor(number: number) {
		return typeof triggerProps === 'function' ? triggerProps(number) : triggerProps;
	}
</script>

<svelte:element this={"style"}>{css}</svelte:element>

{#snippet trigger(number: number)}
	<Menu.Trigger
		{...propsFor(number)}
		handle={detached ? handle : undefined}
		id={`trigger-${number}`}
		data-testid={`trigger-${number}`}
		payload={number}>{`Trigger ${number}`}</Menu.Trigger
	>
{/snippet}

{#snippet wrapped(level: number)}
	{#if level > 0}
		<div>{@render wrapped(level - 1)}</div>
	{:else}
		{#each numbers as number (number)}{@render trigger(number)}{/each}
	{/if}
{/snippet}

{#snippet body({ payload }: { payload: number | undefined })}
	{#if !detached}{@render wrapped(nesting)}{/if}
	<!--
		Hidden so the payload text takes no space. Rendered before the triggers (`rootFirst`), its
		change from "No payload" to "2" would move a pressed trigger out from under the pointer when a
		frame paints between press and release, and that release cancels the open, as upstream.
	-->
	<span data-testid="root-payload" hidden
		>{payload === undefined ? 'No payload' : String(payload)}</span
	>
	<Menu.Portal>
		<Menu.Positioner data-testid="positioner" {...positionerProps}>
			<Menu.Popup data-testid="popup" {...popupProps}>
				{#snippet render(props, state, children)}
					{onPopupState?.(state)}
					<div {...props as Bag}>{@render children?.()}</div>
				{/snippet}
				{#if withViewport}
					<Menu.Viewport>
						<Menu.Item data-testid="content">{String(payload)}</Menu.Item>
					</Menu.Viewport>
				{:else}
					<Menu.Item data-testid="content">{String(payload)}</Menu.Item>
				{/if}
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
{/snippet}

{#snippet root()}
	{#if rootMounted}
		{#if bindOpen}
			<Menu.Root
				handle={detached ? handle : undefined}
				{...rootProps}
				bind:open
				bind:triggerId
				children={body}
			/>
		{:else}
			<Menu.Root
				handle={detached ? handle : undefined}
				{open}
				{triggerId}
				{...rootProps}
				children={body}
			/>
		{/if}
	{/if}
{/snippet}

{#if !detached}
	{@render root()}
{:else if rootFirst}
	{@render root()}
	{@render wrapped(nesting)}
{:else}
	{@render wrapped(nesting)}
	{@render root()}
{/if}
