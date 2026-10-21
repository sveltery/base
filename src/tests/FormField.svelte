<script lang="ts">
	import { useFormContext } from '#lib/internal/form-context.js';
	import type { FormField } from '#lib/form/types.js';

	let {
		id,
		name,
		valid = true,
		value = 'value',
		tag = 'input',
		onValidate
	}: {
		id: string;
		name?: string;
		valid?: boolean | null;
		value?: unknown;
		tag?: 'input' | 'textarea' | 'none';
		onValidate?: (submitCount: number) => void;
	} = $props();

	const form = useFormContext();
	let control = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

	// One registry object for the life of this field. `Map.set` on the same key
	// keeps insertion order, which is what submit uses when trees are disconnected.
	const entry: FormField = {
		get name() {
			return name;
		},
		get control() {
			return control;
		},
		invalid: false,
		syncValidity() {},
		get validityData() {
			return {
				state: {
					badInput: false,
					customError: valid === false,
					patternMismatch: false,
					rangeOverflow: false,
					rangeUnderflow: false,
					stepMismatch: false,
					tooLong: false,
					tooShort: false,
					typeMismatch: false,
					valueMissing: false,
					valid
				},
				error: valid === false ? 'invalid' : '',
				errors: valid === false ? ['invalid'] : [],
				value,
				initialValue: null
			};
		},
		validate() {
			onValidate?.(form.submitCount);
		},
		getValue() {
			return value;
		},
		owns(element) {
			return element === control;
		}
	};

	// The browser's constraint check is Form's submit gate, so an invalid entry is an invalid input.
	$effect(() => {
		control?.setCustomValidity(valid === false ? 'invalid' : '');
	});

	$effect(() => {
		const fields = form.fields;
		fields.set(id, entry);
		return () => {
			if (fields.get(id) === entry) fields.delete(id);
		};
	});
</script>

{#if tag === 'input'}
	<input data-testid={id} {name} value={String(value)} bind:this={control} />
{:else if tag === 'textarea'}
	<textarea data-testid={id} {name} value={String(value)} bind:this={control}></textarea>
{/if}
