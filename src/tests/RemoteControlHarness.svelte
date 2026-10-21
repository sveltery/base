<!--
	One control in a named Field of a remote form on Kit's own `fields` proxy. With `spread`, the
	control takes it, as `{...f.fields.x.as(kind)}`. Without one, the control binds itself.
-->
<script lang="ts">
	import { Field, Form, Select } from '#lib';

	let {
		fields,
		name,
		control,
		spread,
		props = {}
	}: {
		/** Kit's `fields` proxy. */
		fields: unknown;
		/** Field.Root's path. */
		name: string;
		control: 'select' | 'select multiple';
		spread?: Record<string, unknown>;
		/** More props for the control's root. */
		props?: Record<string, unknown>;
	} = $props();

	const remote = $derived({
		method: 'POST' as const,
		action: '?/remote=form',
		fields,
		pending: 0,
		submitted: false
	});
	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'fr', label: 'Français' },
		{ value: 'de', label: 'Deutsch' }
	];
</script>

<Form form={remote}>
	<Field.Root {name} data-testid="field">
		{#if control === 'select' || control === 'select multiple'}
			<Select.Root
				{...spread}
				{...props}
				items={languages}
				multiple={control === 'select multiple'}
			>
				<Select.Trigger data-testid="trigger"><Select.Value /></Select.Trigger>
				<Select.Portal>
					<Select.Positioner>
						<Select.Popup>
							{#each languages as language (language.value)}
								<Select.Item value={language.value}>
									<Select.ItemText>{language.label}</Select.ItemText>
								</Select.Item>
							{/each}
						</Select.Popup>
					</Select.Positioner>
				</Select.Portal>
			</Select.Root>
		{/if}
		<Field.Error data-testid="error" />
	</Field.Root>
</Form>
