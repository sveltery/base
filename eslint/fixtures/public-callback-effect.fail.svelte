<script lang="ts">
	let onValueChange: ((value: string) => void) | undefined = undefined;
	let value = '';
	$effect(() => {
		onValueChange?.(value);
	});
</script>
