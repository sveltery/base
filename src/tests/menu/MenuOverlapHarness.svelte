<!--
	Two roots share one handle while the incoming root opens by trigger id on mount.
	Derived from Base UI v1.9.0 packages/react/test/detachedTriggersConformanceTests.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu, type MenuHandle } from '#lib';

	let {
		handle,
		phase = 'outgoing',
		onOpenError
	}: {
		handle: MenuHandle<number>;
		phase?: 'outgoing' | 'overlap' | 'incoming';
		onOpenError?: (error: unknown) => void;
	} = $props();

	function openOnMount() {
		try {
			handle.open('trigger-2');
		} catch (error) {
			onOpenError?.(error);
		}
	}
</script>

{#snippet menu(key: string)}
	<Menu.Root {handle}>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>{key}</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{/snippet}

{#each [1, 2] as number (number)}
	<Menu.Trigger {handle} id="trigger-{number}" data-testid="trigger-{number}">
		Trigger {number}
	</Menu.Trigger>
{/each}
{#if phase === 'outgoing' || phase === 'overlap'}
	{@render menu('outgoing')}
{/if}
{#if phase === 'overlap' || phase === 'incoming'}
	{@render menu('incoming')}
	<span {@attach () => openOnMount()}></span>
{/if}
