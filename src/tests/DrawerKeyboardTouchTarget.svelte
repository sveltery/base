<script lang="ts">
	import { findDrawerVirtualKeyboard } from '../lib/drawer/context.svelte.js';

	const keyboard = findDrawerVirtualKeyboard();
</script>

<input
	data-testid="input"
	type="text"
	ontouchstart={(event) => keyboard?.onTouchStart(event)}
	ontouchend={(event) => keyboard?.onTouchEnd(event)}
/>
