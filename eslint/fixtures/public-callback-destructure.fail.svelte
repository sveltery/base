<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	const { getOnValueChange: publish } = options;
	publish()?.('next');
</script>
