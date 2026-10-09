<script lang="ts">
	let renderer: (value: string) => string = (value) => value;
	function setRenderer(next: (value: string) => string) {
		renderer = next;
	}
	setRenderer((current) => current);
</script>
