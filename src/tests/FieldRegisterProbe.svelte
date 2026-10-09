<script lang="ts">
	/* eslint-disable sveltery/no-direct-field-registration -- the probe wraps registerControl so the harness can count registrations */
	import { useFieldContext } from '../lib/field/context.svelte.js';
	import type { FieldControlRegistration } from '../lib/field/model.svelte.js';

	let { count = $bindable(0) }: { count?: number } = $props();

	const field = useFieldContext();
	const original = field.registerControl.bind(field);
	field.registerControl = (source: symbol, registration: FieldControlRegistration | undefined) => {
		count += 1;
		original(source, registration);
	};
</script>

<span hidden>{count}</span>
