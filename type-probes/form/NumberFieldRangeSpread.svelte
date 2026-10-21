<!-- expect-error: Type '"range"' is not assignable to type '"number"' -->
<!-- NumberField.Root types its hidden input as `number`, so a range spread is a type error. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { NumberField } from '#lib';

	const f = {} as RemoteForm<{ seats: number }, unknown>;
</script>

<NumberField.Root {...f.fields.seats.as('range')}>
	<NumberField.Input />
</NumberField.Root>
