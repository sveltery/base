<script lang="ts">
	import { Menu, Menubar } from '#lib';
	let { log, scenario }: { log: string[]; scenario: 'menu' | 'menubar' } = $props();
	const rec = (name: string) => (open: boolean, d: { reason: string }) =>
		log.push(`${name}:${open ? 'open' : 'close'}:${d.reason}`);
	const more = Menu.createHandle();
</script>

{#snippet outer(name: string)}
	<Menu.Root onOpenChange={rec(name)}>
		<Menu.Trigger data-testid="{name}-trigger">{name}</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup data-testid={name}>
					<Menu.Item>Item</Menu.Item>
					{#if name === 'file'}
						<Menu.Trigger handle={more} data-testid="more-trigger">More</Menu.Trigger>
					{/if}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{/snippet}

{#if scenario === 'menubar'}
	<Menubar>{@render outer('file')}{@render outer('edit')}</Menubar>
{:else}
	{@render outer('file')}
{/if}
<Menu.Root handle={more} onOpenChange={rec('more')}>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup data-testid="more"><Menu.Item data-testid="more-item">M1</Menu.Item></Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
