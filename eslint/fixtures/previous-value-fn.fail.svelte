<script lang="ts">
	import { noteValue } from './previous-value-fn.js';

	let value = '';
	$effect(() => {
		noteValue(value);
	});
</script>
