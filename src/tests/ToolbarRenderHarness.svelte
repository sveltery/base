<!--
	Switch, Toggle and ToggleGroup inside a Toolbar.
	Derived from Base UI v1.9.0 packages/react/src/toolbar/button/ToolbarButton.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu, Switch, Toggle, ToggleGroup, Toolbar } from '#lib';

	let {
		scenario,
		disabled = false,
		multiple = false,
		twoDisabled = false,
		value = $bindable(),
		onclick,
		onCheckedChange,
		onPressedChange,
		onValueChange,
		onOpenChange
	}: {
		scenario:
			| 'button'
			| 'menu'
			| 'switch'
			| 'toggles'
			| 'direct'
			| 'group-disabled'
			| 'mixed'
			| 'toggle-after'
			| 'span-toggle';
		disabled?: boolean;
		multiple?: boolean;
		twoDisabled?: boolean;
		value?: string[];
		onclick?: (event: MouseEvent) => void;
		onCheckedChange?: (checked: boolean) => void;
		onPressedChange?: (pressed: boolean) => void;
		onValueChange?: (value: string[]) => void;
		onOpenChange?: (open: boolean) => void;
	} = $props();
</script>

<Toolbar.Root aria-label="Tools">
	{#if scenario === 'button'}
		<Toolbar.Button {disabled}>
			{#snippet render(props)}
				<button {...props}>Save</button>
			{/snippet}
		</Toolbar.Button>
	{:else if scenario === 'menu'}
		<Menu.Root {onOpenChange}>
			<Toolbar.Button data-testid="button" {disabled} {onclick}>
				{#snippet render(props)}
					<Menu.Trigger {...props}>Toggle</Menu.Trigger>
				{/snippet}
			</Toolbar.Button>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup>
						<Menu.Item>1</Menu.Item>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	{:else if scenario === 'switch'}
		<Toolbar.Button data-testid="button" {disabled} {onclick}>
			{#snippet render(props)}
				<Switch.Root {...props} {onCheckedChange} />
			{/snippet}
		</Toolbar.Button>
	{:else if scenario === 'toggles'}
		<Toolbar.Button {disabled} value="apple">
			{#snippet render(props)}
				<Toggle {...props} {onPressedChange} />
			{/snippet}
		</Toolbar.Button>
		<ToggleGroup>
			<Toolbar.Button {disabled} value="one">
				{#snippet render(props)}
					<Toggle {...props} {onPressedChange} />
				{/snippet}
			</Toolbar.Button>
			<Toolbar.Button {disabled} value="two">
				{#snippet render(props)}
					<Toggle {...props} {onPressedChange} />
				{/snippet}
			</Toolbar.Button>
		</ToggleGroup>
	{:else if scenario === 'direct'}
		<ToggleGroup {multiple} bind:value {onValueChange}>
			<Toggle value="one" data-testid="one" />
			<Toggle value="two" data-testid="two" disabled={twoDisabled} />
			<Toggle value="three" data-testid="three" />
		</ToggleGroup>
	{:else if scenario === 'toggle-after'}
		<Toolbar.Button data-testid="before" />
		<Toolbar.Button data-testid="toggle">
			{#snippet render(props)}
				<Toggle {...props} />
			{/snippet}
		</Toolbar.Button>
	{:else if scenario === 'span-toggle'}
		<Toolbar.Button data-testid="before" />
		<ToggleGroup>
			<Toggle value="one" data-testid="one" nativeButton={false} disabled>
				{#snippet render(props)}<span {...props}>One</span>{/snippet}
			</Toggle>
		</ToggleGroup>
		<Toolbar.Button data-testid="after" />
	{:else if scenario === 'mixed'}
		<Toolbar.Button data-testid="before" />
		<ToggleGroup>
			<Toggle value="one" data-testid="one" />
			<Toggle value="two" data-testid="two" />
		</ToggleGroup>
		<Toolbar.Button data-testid="after" />
	{:else}
		<Toolbar.Button data-testid="before" />
		<Toolbar.Group disabled>
			<ToggleGroup>
				<Toggle value="one" data-testid="one" />
				<Toggle value="two" data-testid="two" />
			</ToggleGroup>
		</Toolbar.Group>
		<Toolbar.Button data-testid="after" />
	{/if}
</Toolbar.Root>
