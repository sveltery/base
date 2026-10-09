<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	const { getOnValueChange: readChange } = options;
	readChange()?.('next');
</script>
