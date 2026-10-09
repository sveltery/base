<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	const [publish] = [options.getOnValueChange()];
	publish?.('next');
</script>
