<!-- Scenario 4: TanStack Form owns values and validation. Base shows its state and errors. -->
<script lang="ts">
	import { createForm, revalidateLogic } from '@tanstack/svelte-form';
	import * as v from 'valibot';
	import { Checkbox, Field, Form } from '#lib';
	import { tanstackField } from '#lib/form/tanstack/index.js';
	import FixturePage from '../shared/FixturePage.svelte';

	const schema = v.object({
		username: v.pipe(v.string(), v.minLength(3, 'At least 3 characters')),
		email: v.pipe(v.string(), v.email('Invalid email address')),
		seats: v.pipe(v.number(), v.minValue(1, 'At least one seat')),
		agree: v.literal(true, 'Accept the terms')
	});
	let submitted = $state<unknown>(null);
	const form = createForm(() => ({
		defaultValues: { username: '', email: '', seats: 1, agree: false },
		validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
		validators: { onDynamic: schema },
		onSubmit: ({ value }) => {
			submitted = value;
		}
	}));
</script>

<FixturePage debug={{ submitted }}>
	<Form onsubmit={(event) => (event.preventDefault(), form.handleSubmit())}>
		<form.Field name="username">
			{#snippet children(field)}
				<Field.Root field={tanstackField(field)} data-field="username">
					<Field.Label>Username</Field.Label>
					<Field.Control placeholder="e.g. alice132" />
					<Field.Error data-testid="error" />
				</Field.Root>
			{/snippet}
		</form.Field>
		<form.Field name="email">
			{#snippet children(field)}
				<Field.Root field={tanstackField(field)} type="email" data-field="email">
					<Field.Label>Email</Field.Label>
					<Field.Control />
					<Field.Error data-testid="error" />
				</Field.Root>
			{/snippet}
		</form.Field>
		<form.Field name="seats">
			{#snippet children(field)}
				<Field.Root field={tanstackField(field)} type="number" data-field="seats">
					<Field.Label>Seats</Field.Label>
					<Field.Control />
					<Field.Error data-testid="error" />
				</Field.Root>
			{/snippet}
		</form.Field>
		<form.Field name="agree">
			{#snippet children(field)}
				<Field.Root field={tanstackField(field)} type="checkbox" data-field="agree">
					<Field.Label>
						<Checkbox.Root
							style="display: inline-block; width: 16px; height: 16px; border: 1px solid"
						/>
						I accept the terms
					</Field.Label>
					<Field.Error data-testid="error" />
				</Field.Root>
			{/snippet}
		</form.Field>
		<button>Submit</button>
		<button type="reset">Reset</button>
	</Form>
</FixturePage>
