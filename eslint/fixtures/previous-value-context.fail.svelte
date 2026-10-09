<script lang="ts">
	import { useWidget } from './previous-value-context.js';

	const model = useWidget();
	$effect(() => {
		model.noteValue(model.value);
	});
</script>
