<script lang="ts">
	import type { Snippet } from 'svelte';
	import { NavigationMenu } from '#lib';

	type Part =
		| 'root'
		| 'list'
		| 'item'
		| 'trigger'
		| 'icon'
		| 'content'
		| 'link'
		| 'portal'
		| 'backdrop'
		| 'positioner'
		| 'popup'
		| 'arrow'
		| 'viewport';

	let { part, variant = 'host' }: { part: Part; variant?: 'host' | 'render' } = $props();

	function mark(node: HTMLElement) {
		node.dataset.attached = 'yes';
	}

	const replacement = $derived(variant === 'render' ? swap : undefined);
	const probe = $derived({
		'data-testid': 'part',
		class: 'probe',
		'data-probe': 'probe',
		render: replacement
	});
</script>

{#snippet swap(props: object, _state: unknown, children: Snippet | undefined)}
	<div {...props} data-replacement="">
		{@render children?.()}
	</div>
{/snippet}

{#snippet popupParts(arrow: boolean)}
	<NavigationMenu.Portal>
		<NavigationMenu.Positioner>
			<NavigationMenu.Popup>
				{#if arrow}<NavigationMenu.Arrow {...probe} {@attach mark} />{/if}
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
{/snippet}

{#if part === 'root'}
	<NavigationMenu.Root {...probe} {@attach mark}>Root</NavigationMenu.Root>
{:else if part === 'list'}
	<NavigationMenu.Root>
		<NavigationMenu.List {...probe} {@attach mark}>
			<NavigationMenu.Item>Item</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
{:else if part === 'item'}
	<NavigationMenu.Root>
		<NavigationMenu.Item {...probe} {@attach mark}>Item</NavigationMenu.Item>
	</NavigationMenu.Root>
{:else if part === 'trigger'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger {...probe} nativeButton={variant === 'host'} {@attach mark}>
					Trigger
				</NavigationMenu.Trigger>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
{:else if part === 'icon'}
	<NavigationMenu.Root>
		<NavigationMenu.Item>
			<NavigationMenu.Icon {...probe} {@attach mark} />
		</NavigationMenu.Item>
	</NavigationMenu.Root>
{:else if part === 'content'}
	<NavigationMenu.Root value="test">
		<NavigationMenu.List>
			<NavigationMenu.Item value="test">
				<NavigationMenu.Content {...probe} {@attach mark}>Content</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render popupParts(false)}
	</NavigationMenu.Root>
{:else if part === 'link'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Link href="#link" {...probe} {@attach mark}>Link</NavigationMenu.Link>
		</NavigationMenu.List>
	</NavigationMenu.Root>
{:else if part === 'portal'}
	<NavigationMenu.Root value="item">
		<NavigationMenu.Portal {...probe} {@attach mark}>Portal</NavigationMenu.Portal>
	</NavigationMenu.Root>
{:else if part === 'backdrop'}
	<NavigationMenu.Root>
		<NavigationMenu.Backdrop {...probe} {@attach mark} />
	</NavigationMenu.Root>
{:else if part === 'positioner'}
	<NavigationMenu.Root value="test">
		<NavigationMenu.Portal>
			<NavigationMenu.Positioner {...probe} {@attach mark}>Positioner</NavigationMenu.Positioner>
		</NavigationMenu.Portal>
	</NavigationMenu.Root>
{:else if part === 'popup'}
	<NavigationMenu.Root value="test">
		<NavigationMenu.Portal>
			<NavigationMenu.Positioner>
				<NavigationMenu.Popup {...probe} {@attach mark}>Popup</NavigationMenu.Popup>
			</NavigationMenu.Positioner>
		</NavigationMenu.Portal>
	</NavigationMenu.Root>
{:else if part === 'arrow'}
	<NavigationMenu.Root value="test">
		{@render popupParts(true)}
	</NavigationMenu.Root>
{:else}
	<NavigationMenu.Root>
		<NavigationMenu.Viewport {...probe} {@attach mark}>Viewport</NavigationMenu.Viewport>
	</NavigationMenu.Root>
{/if}
