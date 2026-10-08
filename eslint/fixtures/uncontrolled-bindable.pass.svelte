<script lang="ts">
	function createControllableValue<T>(options: {
		getProp: () => T | undefined;
		setProp: (next: T | undefined) => void;
		getDefault: () => T;
	}) {
		return { value: options.getProp() ?? options.getDefault() };
	}

	let { checked = $bindable<boolean | undefined>(undefined), value = $bindable('') } = $props();

	const controllable = createControllableValue<boolean>({
		getProp: () => checked,
		setProp: (next) => {
			checked = next;
		},
		getDefault: () => false
	});
</script>

<input bind:value />
<p>{controllable.value}</p>
