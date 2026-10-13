<script lang="ts" generics="T">
	let { value, onValue }: { value: T; onValue: (value: T) => void } = $props();

	$effect.pre(() => {
		onValue(value);
	});
</script>
