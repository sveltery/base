<script lang="ts">
	// Copied from RadioGroup, FieldControl, FieldError, and NumberFieldInput.
	let checkedValue: unknown = undefined;
	let nameState = '';
	const formContext = { clearErrors(_name: string) {} };
	let sawChecked = false;
	let previousChecked: unknown = checkedValue;

	$effect(() => {
		const current = checkedValue;
		const fieldName = nameState;
		if (!sawChecked) {
			sawChecked = true;
			previousChecked = current;
			return;
		}
		if (Object.is(current, previousChecked)) return;
		previousChecked = current;
		formContext.clearErrors(fieldName);
	});

	let sawControlledValue = false;
	let previousSerialized: string | undefined;
	const serialized: string | undefined = undefined;
	$effect(() => {
		const current = serialized;
		if (!sawControlledValue) {
			sawControlledValue = true;
			previousSerialized = current;
			return;
		}
		previousSerialized = current;
	});

	let lastKey: string | null = null;
	let lastMessage: string | null = null;
	const message: string | null = null;
	const rendered = false;
	$effect.pre(() => {
		if (!rendered) return;
		const current = message;
		const key = current ?? '';
		if (key === lastKey) return;
		lastKey = key;
		lastMessage = current;
	});

	let sawValue = false;
	let previousValue: number | null = null;
	$effect(() => {
		const current: number | null = null;
		if (!sawValue) {
			sawValue = true;
			previousValue = current;
			return;
		}
		if (Object.is(current, previousValue)) return;
		previousValue = current;
	});
</script>
