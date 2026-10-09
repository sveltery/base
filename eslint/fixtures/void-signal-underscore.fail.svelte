<script lang="ts">
	let value = 0;

	function touch(_value: number) {
		return 0;
	}

	$effect(() => {
		touch(value);
		const _local = value;
	});
</script>
