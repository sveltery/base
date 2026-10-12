<script lang="ts">
	// Model getters and a $bindable setter. No effect copies the prop.
	let {
		value = $bindable(undefined),
		disabled = false,
		orientation = 'horizontal',
		loopFocus = true
	}: {
		value?: unknown;
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		loopFocus?: boolean;
	} = $props();

	const EMPTY: unknown[] = [];

	function readProp<T>(options: { getProp: () => T | undefined }) {
		return options.getProp();
	}

	const current = readProp({ getProp: () => value });

	const model = {
		get value() {
			return value;
		},
		set value(next: unknown) {
			value = next;
		},
		get disabled() {
			return Boolean(disabled);
		},
		readLoopFocus: () => loopFocus,
		readOrientation: () => orientation
	};

	function commit(next: unknown) {
		model.value = next;
		return EMPTY;
	}

	commit(current);
</script>
