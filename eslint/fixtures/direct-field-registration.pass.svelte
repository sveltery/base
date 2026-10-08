<script lang="ts">
	const field = {
		register(source: symbol, registration: unknown) {
			return registration ?? source;
		}
	};
	field.register(Symbol(), undefined);
</script>
