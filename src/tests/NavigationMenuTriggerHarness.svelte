<script lang="ts">
	import { DirectionProvider, NavigationMenu } from '#lib';

	let {
		variant,
		disabled = $bindable(true),
		value = $bindable(null),
		aIsActive = $bindable(false)
	}: {
		variant:
			| 'disabled'
			| 'rtl'
			| 'single'
			| 'focus'
			| 'width'
			| 'reposition'
			| 'rapid'
			| 'drops'
			| 'sweep';
		disabled?: boolean;
		value?: string | null;
		aIsActive?: boolean;
	} = $props();

	let isProductExpanded = $state(false);
</script>

{#snippet popup(keepMounted = false)}
	<NavigationMenu.Portal {keepMounted}>
		<NavigationMenu.Positioner data-testid="positioner">
			<NavigationMenu.Popup data-testid="popup-root" class="test-navigation-menu-popup">
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
{/snippet}

{#if variant === 'disabled'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger {disabled} data-testid="trigger">Overview</NavigationMenu.Trigger>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
	<button type="button" data-testid="enable" onclick={() => (disabled = false)}>enable</button>
{:else if variant === 'rtl'}
	<DirectionProvider direction="rtl">
		<NavigationMenu.Root orientation="vertical">
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger data-testid="trigger">Overview</NavigationMenu.Trigger>
					<NavigationMenu.Content>
						<NavigationMenu.Link href="#" data-testid="link">Quick Start</NavigationMenu.Link>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			</NavigationMenu.List>
			{@render popup()}
		</NavigationMenu.Root>
	</DirectionProvider>
{:else if variant === 'single'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="trigger">Overview</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#quick-start" data-testid="link"
						>Quick Start</NavigationMenu.Link
					>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render popup()}
	</NavigationMenu.Root>
{:else if variant === 'focus'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="overview">Overview</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#" data-testid="overview-link">Quick Start</NavigationMenu.Link
					>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="handbook">Handbook</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#" data-testid="handbook-link">
						Styling Base UI components
					</NavigationMenu.Link>
				</NavigationMenu.Content>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#">Second Link</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render popup()}
	</NavigationMenu.Root>
{:else if variant === 'width'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="no-content">noContent</NavigationMenu.Trigger>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="with-content">withContent</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#" data-testid="link"
						>Styling Base UI components</NavigationMenu.Link
					>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render popup()}
	</NavigationMenu.Root>
{:else if variant === 'reposition'}
	<NavigationMenu.Root>
		<NavigationMenu.List style="display: flex">
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="overview">Overview</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#" data-testid="overview-link"
						>Overview Link</NavigationMenu.Link
					>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger data-testid="handbook">Handbook</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#" data-testid="handbook-link"
						>Handbook Link</NavigationMenu.Link
					>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render popup()}
	</NavigationMenu.Root>
{:else if variant === 'rapid'}
	<NavigationMenu.Root>
		<svelte:element this={"style"}>
			{`.test-navigation-menu-popup {
				transition: width 350ms cubic-bezier(0.22, 1, 0.36, 1), height 350ms cubic-bezier(0.22, 1, 0.36, 1);
				width: var(--popup-width);
				height: var(--popup-height);
			}`}
		</svelte:element>
		<NavigationMenu.List style="display: flex">
			<NavigationMenu.Item value="product">
				<NavigationMenu.Trigger data-testid="product">Product</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<div>
						<button type="button" data-testid="expand" onclick={() => (isProductExpanded = true)}>
							Expand Product
						</button>
						{#if isProductExpanded}
							<div style="width: 760px; height: 460px">Expanded product panel</div>
						{:else}
							<div style="width: 700px; height: 420px">Product panel</div>
						{/if}
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item value="solutions">
				<NavigationMenu.Trigger data-testid="solutions">Solutions</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<div style="width: 500px; height: 320px" data-testid="solutions-panel">
						Solutions panel
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render popup()}
	</NavigationMenu.Root>
{:else if variant === 'drops'}
	<NavigationMenu.Root bind:value>
		<NavigationMenu.List data-testid="list">
			{#if aIsActive}
				<NavigationMenu.Item value="a">
					<a href="#a">A active</a>
				</NavigationMenu.Item>
			{:else}
				<NavigationMenu.Item value="a">
					<NavigationMenu.Trigger data-testid="trigger-a">A</NavigationMenu.Trigger>
					<NavigationMenu.Content>
						<NavigationMenu.Link href="#a" data-testid="link-a">A link</NavigationMenu.Link>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			{/if}
			<NavigationMenu.Item value="b">
				<NavigationMenu.Trigger data-testid="trigger-b">B</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#b">B link</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render popup()}
	</NavigationMenu.Root>
	<button
		type="button"
		data-testid="navigate"
		onclick={() => {
			value = null;
			aIsActive = true;
		}}
	>
		Navigate
	</button>
{:else}
	<NavigationMenu.Root>
		<NavigationMenu.List data-testid="list">
			<NavigationMenu.Item value="a">
				<NavigationMenu.Trigger data-testid="trigger-a">A</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#a" data-testid="link-a">A link</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item value="b">
				<NavigationMenu.Trigger data-testid="trigger-b">B</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#b">B link</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render popup(true)}
	</NavigationMenu.Root>
{/if}
