<script lang="ts">
	import { DirectionProvider, Radio, RadioGroup, Tabs, Toggle, ToggleGroup, Toolbar } from '#lib';

	let {
		scenario,
		direction = 'ltr',
		value = 0,
		listStyle = '',
		itemStyle = ''
	}: {
		scenario: 'tabs' | 'toggle-group' | 'toolbar-toggle-group' | 'radio-input';
		direction?: 'ltr' | 'rtl';
		value?: number;
		listStyle?: string;
		itemStyle?: string;
	} = $props();

	const items = Array.from({ length: 10 }, (_, index) => index);
	const row = 'display: flex; position: relative; width: 100px; overflow: auto;';
	const column =
		'display: flex; flex-direction: column; position: relative; height: 100px; overflow: auto;';
	const item = 'flex: none; width: 50px; height: 50px; margin: 0; padding: 0; border: 0;';
</script>

<DirectionProvider {direction}>
	<div dir={direction}>
		{#if scenario === 'tabs'}
			<Tabs.Root {value}>
				<Tabs.List data-testid="list" style={row + listStyle}>
					{#each items as index (index)}
						<Tabs.Tab value={index} style={item + itemStyle}>{index}</Tabs.Tab>
					{/each}
				</Tabs.List>
			</Tabs.Root>
		{:else if scenario === 'toggle-group'}
			<ToggleGroup data-testid="list" orientation="vertical" style={column}>
				{#each items as index (index)}
					<Toggle value={String(index)} style={item}>{index}</Toggle>
				{/each}
			</ToggleGroup>
		{:else if scenario === 'toolbar-toggle-group'}
			<Toolbar.Root data-testid="list" style={row}>
				<ToggleGroup
					data-testid="group"
					style="display: flex; flex: none; width: 200px; overflow: auto;"
				>
					{#each items as index (index)}
						<Toggle value={String(index)} style={item}>{index}</Toggle>
					{/each}
				</ToggleGroup>
			</Toolbar.Root>
		{:else}
			<RadioGroup aria-label="Choice">
				<Radio.Root value="a" aria-label="a" />
				<input data-testid="other" aria-label="other" value="abcd" />
				<Radio.Root value="b" aria-label="b" />
			</RadioGroup>
		{/if}
	</div>
</DirectionProvider>
