<script lang="ts">
	const field = {
		registerControl(_source: symbol, _registration: unknown) {}
	};
	const reg = field.registerControl;
	const again = reg;
	again(Symbol(), undefined);
</script>
