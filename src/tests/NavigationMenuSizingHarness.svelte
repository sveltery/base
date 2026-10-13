<script lang="ts">
	import { NavigationMenu } from '#lib';

	let {
		variant = 'keepMounted',
		onOpenChangeComplete
	}: {
		variant?: 'keepMounted' | 'keepMountedClosed' | 'scopedExit' | 'topLevelLinkScoped';
		onOpenChangeComplete?: (open: boolean) => void;
	} = $props();

	const keepMounted = $derived(variant === 'keepMounted' || variant === 'keepMountedClosed');
	const scoped = $derived(variant === 'scopedExit' || variant === 'topLevelLinkScoped');
	const contentClass = $derived(scoped ? 'test-navigation-menu-content' : undefined);

	const scopedPopupAnimationStyles = `
		.test-navigation-menu-popup {
			transition-property: opacity, transform, width, height;
			transition-duration: 350ms;
			transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
		}
		.test-navigation-menu-popup[data-starting-style],
		.test-navigation-menu-popup[data-ending-style] {
			opacity: 0;
			transform: scale(0.9);
		}
		.test-navigation-menu-popup[data-ending-style] {
			transition-property: opacity, transform;
			transition-duration: 150ms;
			transition-timing-function: ease;
		}
		.test-navigation-menu-content {
			transition:
				opacity 175ms ease,
				transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
		}
		.test-navigation-menu-content[data-starting-style],
		.test-navigation-menu-content[data-ending-style] {
			opacity: 0;
		}
		.test-navigation-menu-content[data-starting-style][data-activation-direction='left'] {
			transform: translateX(-2rem);
		}
		.test-navigation-menu-content[data-starting-style][data-activation-direction='right'] {
			transform: translateX(2rem);
		}
		.test-navigation-menu-content[data-ending-style] {
			transition-duration: 175ms;
			transition-timing-function: ease;
		}
		.test-navigation-menu-content[data-ending-style][data-activation-direction='left'] {
			transform: translateX(2rem);
		}
		.test-navigation-menu-content[data-ending-style][data-activation-direction='right'] {
			transform: translateX(-2rem);
		}
	`;
</script>

{#if scoped}
	<svelte:element this={"style"}>{scopedPopupAnimationStyles}</svelte:element>
{/if}

<NavigationMenu.Root value={variant === 'keepMounted' ? 'item-1' : null} {onOpenChangeComplete}>
	<NavigationMenu.List>
		<NavigationMenu.Item value="item-1">
			<NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
			<NavigationMenu.Content {keepMounted} class={contentClass}>
				<div style="width: 675px; height: 220px">Product panel</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
		{#if variant === 'topLevelLinkScoped'}
			<NavigationMenu.Item>
				<NavigationMenu.Link href="#top-level-link" data-testid="top-level-link">
					Top level link
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		{/if}
		<NavigationMenu.Item value="item-2">
			<NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
			<NavigationMenu.Content {keepMounted} class={contentClass}>
				<div style="width: 500px; height: 180px">Learn panel</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal
		keepMounted={variant === 'keepMountedClosed' || variant === 'topLevelLinkScoped'}
	>
		<NavigationMenu.Positioner data-testid={variant === 'scopedExit' ? undefined : 'positioner'}>
			<NavigationMenu.Popup
				class={scoped ? 'test-navigation-menu-popup' : undefined}
				data-testid="popup-root"
			>
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
