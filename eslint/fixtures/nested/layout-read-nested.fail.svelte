<script lang="ts">
	import { measure } from './layout-read-helper.js';
	let el: HTMLElement | null = null;
	const rect = $derived(measure(el));
</script>
