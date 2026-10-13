<!--
	Menus that open without a Menu.Trigger: anchored to a button the consumer tracks, or given a
	trigger only after they opened.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.triggerless.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { Menu, type MenuChangeEventDetails } from '#lib';

	let {
		scenario,
		keepMounted = false,
		initialTrigger = false,
		onOpenChange
	}: {
		scenario: 'anchor' | 'late-trigger';
		keepMounted?: boolean;
		/** Late-trigger scenario: whether the trigger is rendered from the start. */
		initialTrigger?: boolean;
		onOpenChange?: (open: boolean, details: MenuChangeEventDetails) => void;
	} = $props();

	let anchor = $state<HTMLElement | null>(null);
	let hasTrigger = $state(untrack(() => initialTrigger));

	// The controlled `open` of upstream, as a function binding: closing clears the anchor.
	function getOpen() {
		return anchor != null;
	}

	function setOpen(open: boolean) {
		if (!open) anchor = null;
	}
</script>

{#snippet submenu(label: string, item: string, triggerProps = {})}
	<Menu.SubmenuRoot>
		<Menu.SubmenuTrigger openOnHover={false} delay={0} {...triggerProps}
			>{label}</Menu.SubmenuTrigger
		>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Item>{item}</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.SubmenuRoot>
{/snippet}

{#if scenario === 'anchor'}
	<button type="button" onclick={(event) => (anchor = event.currentTarget)}>Open</button>
	<Menu.Root bind:open={getOpen, setOpen} {onOpenChange}>
		<Menu.Portal {keepMounted}>
			<Menu.Positioner {anchor}>
				<Menu.Popup>{@render submenu('More', 'Nested')}</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{:else}
	<Menu.Root open modal={false} {onOpenChange}>
		{#if hasTrigger}<Menu.Trigger>Options</Menu.Trigger>{/if}
		<Menu.Portal>
			<Menu.Positioner anchor={document.body}>
				<Menu.Popup>
					{@render submenu('More', 'Nested', {
						onkeydown: (event: KeyboardEvent) => {
							if (event.key === 'F2') hasTrigger = true;
						}
					})}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{/if}
