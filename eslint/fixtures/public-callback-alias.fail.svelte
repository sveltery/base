<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	const cb = options.getOnValueChange();
	cb?.('next');
</script>
