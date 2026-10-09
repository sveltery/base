<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	function emit(callback: ((value: string) => void) | undefined, value: string) {
		callback?.(value);
	}
	emit(options.getOnValueChange(), 'next');
</script>
