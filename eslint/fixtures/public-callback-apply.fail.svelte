<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	Reflect.apply(options.getOnValueChange(), options, ['next']);
</script>
