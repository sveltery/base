<script lang="ts">
	const options = {
		getOnValueChange: (): ((value: string) => void) | undefined => undefined
	};
	options.getOnValueChange()?.call(options, 'next');
	Reflect.apply(options.getOnValueChange(), options, ['next']);
</script>
