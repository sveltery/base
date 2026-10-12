<script lang="ts">
	import { useClick } from '@sveltery/floating-ui-svelte';
	import { PopupStore, useAnchoredPopupScrollLock } from '#lib/internal/popups/index.js';

	let { enabled = false, wide = false }: { enabled?: boolean; wide?: boolean } = $props();

	let open = $state<boolean | undefined>(false);
	let positioner = $state<HTMLElement | null>(null);
	const store = new PopupStore<string>({
		readOpen: () => open,
		writeOpen: (value) => (open = value),
		floatingId: 'touch-scroll-lock',
		floatingElement: 'positioner',
		onOpenChange: () => () => {},
		onOpenChangeComplete: () => () => {}
	});

	const click = useClick(store);

	useAnchoredPopupScrollLock(() => ({
		enabled: enabled && store.open,
		touchOpen: store.openMethod === 'touch',
		positionerElement: positioner,
		referenceElement: positioner
	}));
</script>

<button type="button" {...click.reference}>Open</button>
<div
	bind:this={positioner}
	data-testid="positioner"
	style:width={wide ? '100vw' : '40px'}
	style:height="20px"
></div>
