<script lang="ts">
	import { createControllableValue } from '#lib/internal/controllable-value.svelte.js';
	import { useClick } from '#lib/internal/floating-ui/index.js';
	import { PopupStore, useAnchoredPopupScrollLock } from '#lib/internal/popups/index.js';

	let { enabled = false, wide = false }: { enabled?: boolean; wide?: boolean } = $props();

	let open = $state<boolean | undefined>(false);
	let positioner = $state<HTMLElement | null>(null);
	const store = new PopupStore<string>({
		open: createControllableValue<boolean>({
			getProp: () => open,
			setProp: (value) => (open = value),
			getDefault: () => false
		}),
		floatingId: 'touch-scroll-lock',
		floatingElement: 'positioner',
		onOpenChange: () => () => {},
		onOpenChangeComplete: () => () => {}
	});

	const click = useClick(store);

	useAnchoredPopupScrollLock(() => ({
		enabled: enabled && store.open,
		touchOpen: store.openPointerType === 'touch',
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
