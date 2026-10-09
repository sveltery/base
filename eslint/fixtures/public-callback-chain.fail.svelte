<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	const first = options.getOnValueChange();
	const second = first;
	second?.('next');
</script>
