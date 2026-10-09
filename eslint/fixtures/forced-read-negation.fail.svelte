<script lang="ts">
	let flag = true;
	let height: number | null = 1;
	let width: number | null = 1;

	function subscribe() {
		if (flag && !(height == null && width == null)) return 1;
		return 0;
	}

	subscribe();
</script>
