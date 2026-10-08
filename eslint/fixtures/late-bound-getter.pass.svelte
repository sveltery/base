<script lang="ts">
	class Model {
		readonly readValue: () => string;
		readonly readDisabled: () => boolean;

		constructor(readValue: () => string, readDisabled: () => boolean) {
			this.readValue = readValue;
			this.readDisabled = readDisabled;
		}
	}

	const model = new Model(
		() => 'ok',
		() => false
	);
	void model.readValue();
</script>
