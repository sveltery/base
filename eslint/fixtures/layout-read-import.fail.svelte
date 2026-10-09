<script lang="ts">
	import { measure } from './layout-read-helper.js';

	let el: HTMLElement | null = null;
	const rect = $derived(el ? measure(el) : null);
</script>

<span>{rect?.width}</span>
