<script lang="ts">
	const options = {
		getSomething: (): ((value: string) => void) | undefined => undefined
	};
	options.getSomething()?.('next');
</script>
