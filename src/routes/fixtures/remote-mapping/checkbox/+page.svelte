<script lang="ts">
	import { page } from '$app/state';
	import { Checkbox, Field, Form } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { checkboxForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'spread';
	const agree = f.fields.agree.as('checkbox');
</script>

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(agree.name, f.fields.agree.issues())}>
		<Field.Root data-field="agree" name={v === 'root-name' ? agree.name : undefined}>
			<Field.Label>
				{#if v === 'root-name'}
					<Checkbox.Root
						data-testid="control"
						style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
						><Checkbox.Indicator /></Checkbox.Root
					>
				{:else if v === 'spread'}
					<Checkbox.Root
						{...agree}
						data-testid="control"
						style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
						><Checkbox.Indicator /></Checkbox.Root
					>
				{:else if v === 'name'}
					<Checkbox.Root
						name={agree.name}
						data-testid="control"
						style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
						><Checkbox.Indicator /></Checkbox.Root
					>
				{:else if v === 'controlled'}
					<Checkbox.Root
						name={agree.name}
						checked={agree.checked}
						onCheckedChange={(checked) => f.fields.agree.set(checked)}
						data-testid="control"
						style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
						><Checkbox.Indicator /></Checkbox.Root
					>
				{/if}
				Accept the terms
			</Field.Label>
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
