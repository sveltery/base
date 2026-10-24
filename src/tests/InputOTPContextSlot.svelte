<script lang="ts">
	import { getInputOTPContext } from '../lib/input-otp/index.js';

	let { index }: { index: number } = $props();

	const context = getInputOTPContext();
	const slot = $derived(context.slots[index]);
</script>

<div data-testid={`slot-${index}`} data-active={slot.isActive}>{slot.char}</div>
