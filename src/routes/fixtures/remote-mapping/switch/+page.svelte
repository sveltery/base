<script lang="ts">
	import { page } from '$app/state';
	import { Switch, Field, Form } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { switchForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'spread';
	const notify = f.fields.notify.as('checkbox');
</script>

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(notify.name, f.fields.notify.issues())}>
		<Field.Root data-field="notify" name={v === 'root-name' ? notify.name : undefined}>
			<Field.Label>
				{#if v === 'root-name'}
					<Switch.Root
						data-testid="control"
						style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
						><Switch.Thumb /></Switch.Root
					>
				{:else if v === 'spread'}
					<Switch.Root
						{...notify}
						data-testid="control"
						style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
						><Switch.Thumb /></Switch.Root
					>
				{:else if v === 'name'}
					<Switch.Root
						name={notify.name}
						data-testid="control"
						style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
						><Switch.Thumb /></Switch.Root
					>
				{:else if v === 'controlled'}
					<Switch.Root
						name={notify.name}
						checked={notify.checked}
						onCheckedChange={(checked) => f.fields.notify.set(checked)}
						data-testid="control"
						style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
						><Switch.Thumb /></Switch.Root
					>
				{/if}
				Notify me
			</Field.Label>
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
