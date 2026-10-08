<script lang="ts">
	class Model {
		readValues: () => string[] = () => [];
		readDisabled: () => boolean = () => false;
		placementReader: () => string = () => 'bottom';
		commit: () => void = () => {};
		readonly readThreshold: () => number;

		constructor(readThreshold: () => number) {
			this.readThreshold = readThreshold;
		}

		assignLater() {
			this.readValues = () => ['a'];
		}
	}

	const model = new Model(() => 1);
	model.readDisabled = () => true;
	model.placementReader = () => 'top';
	const readValues = () => ['b'];
	Object.assign(model, { readValues });
	Object.assign(model, { ...{ readDisabled: () => false } });
	model.commit = () => {};
</script>
