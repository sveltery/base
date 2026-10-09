<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined,
		onValueChange: undefined as ((value: string) => void) | undefined
	};
	function callPublic(fn: ((value: string) => void) | undefined, value: string) {
		fn?.(value);
	}
	callPublic(options.getOnValueChange(), 'next');
	options.onValueChange?.('next');
</script>
