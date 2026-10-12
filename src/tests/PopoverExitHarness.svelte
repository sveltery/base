<script lang="ts">
	import { Popover } from '../lib/index.js';
</script>

<Popover.Root modal>
	<Popover.Trigger>Open</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner data-testid="positioner" class="slide">
			<Popover.Popup class="hold" data-testid="popup">
				<Popover.Close>Close</Popover.Close>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>

<style>
	:global(.slide) {
		transition: top 1s;
	}

	:global(.hold[data-ending-style]) {
		animation: sveltery-exit-hold 3s linear both;
	}

	@keyframes -global-sveltery-exit-hold {
		from {
			opacity: 1;
		}
		to {
			opacity: 0.5;
		}
	}
</style>
