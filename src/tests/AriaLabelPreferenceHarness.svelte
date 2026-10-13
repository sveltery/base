<script lang="ts">
	import { Checkbox, Field, Radio, RadioGroup, Switch } from '#lib';

	let {
		control = 'checkbox',
		scenario = 'wrapped',
		ariaLabel = undefined,
		labelType = 'native',
		showLabel = true
	}: {
		control?: 'checkbox' | 'switch' | 'radio';
		scenario?: 'wrapped' | 'dynamic';
		ariaLabel?: string;
		labelType?: 'native' | 'field';
		showLabel?: boolean;
	} = $props();
</script>

{#snippet root(id?: string)}
	{#if control === 'checkbox'}
		<Checkbox.Root {id} aria-label={ariaLabel} />
	{:else if control === 'switch'}
		<Switch.Root {id} aria-label={ariaLabel} />
	{:else}
		<Radio.Root {id} value={id ?? 'a'} aria-label={ariaLabel} />
	{/if}
{/snippet}

{#snippet body()}
	{#if scenario === 'wrapped'}
		<label>
			{@render root()}
			Native label
		</label>
		{#if control !== 'radio'}
			<Field.Root>
				<Field.Label>
					{@render root()}
					Field label
				</Field.Label>
			</Field.Root>
			<label for="sibling-control">Sibling label</label>
			{@render root('sibling-control')}
		{/if}
	{:else}
		<Field.Root>
			{#if showLabel}
				{#if labelType === 'native'}
					<label for="dynamic-control">Associated label</label>
				{:else}
					<Field.Label>Associated label</Field.Label>
				{/if}
			{/if}
			{@render root('dynamic-control')}
		</Field.Root>
	{/if}
{/snippet}

{#if control === 'radio'}
	<RadioGroup>{@render body()}</RadioGroup>
{:else}
	{@render body()}
{/if}
