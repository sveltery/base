<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	options.getOnValueChange()?.('next');
</script>
