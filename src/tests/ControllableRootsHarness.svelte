<script lang="ts">
	import {
		Accordion,
		Checkbox,
		CheckboxGroup,
		Collapsible,
		Switch,
		Toggle,
		ToggleGroup
	} from '#lib';

	type Part =
		| 'switch'
		| 'checkbox'
		| 'toggle'
		| 'collapsible'
		| 'accordion'
		| 'toggle-group'
		| 'checkbox-group';

	let {
		part,
		mode,
		onChange
	}: {
		part: Part;
		mode: 'bind' | 'parent' | 'default';
		onChange?: (value: unknown) => void;
	} = $props();

	let checked = $state<boolean | undefined>(undefined);
	let pressed = $state<boolean | undefined>(undefined);
	let open = $state<boolean | undefined>(undefined);
	let values = $state<unknown[] | undefined>(undefined);
	let strings = $state<string[] | undefined>(undefined);

	const owner = $derived.by(() => {
		if (part === 'switch' || part === 'checkbox')
			return checked === undefined ? 'none' : String(checked);
		if (part === 'toggle') return pressed === undefined ? 'none' : String(pressed);
		if (part === 'collapsible') return open === undefined ? 'none' : String(open);
		if (part === 'accordion') return values === undefined ? 'none' : values.map(String).join(',');
		return strings === undefined ? 'none' : strings.join(',');
	});
</script>

<p data-testid="owner">{owner}</p>

{#if part === 'switch'}
	{#if mode === 'bind'}
		<Switch.Root bind:checked onCheckedChange={(next) => onChange?.(next)}
			>Notifications</Switch.Root
		>
	{:else if mode === 'parent'}
		<button type="button" onclick={() => (checked = true)}>Set value</button>
		<Switch.Root {checked} onCheckedChange={(next) => onChange?.(next)}>Notifications</Switch.Root>
	{:else}
		<Switch.Root defaultChecked onCheckedChange={(next) => onChange?.(next)}
			>Notifications</Switch.Root
		>
	{/if}
{:else if part === 'checkbox'}
	{#if mode === 'bind'}
		<Checkbox.Root bind:checked onCheckedChange={(next) => onChange?.(next)}
			>Notifications</Checkbox.Root
		>
	{:else if mode === 'parent'}
		<button type="button" onclick={() => (checked = true)}>Set value</button>
		<Checkbox.Root {checked} onCheckedChange={(next) => onChange?.(next)}
			>Notifications</Checkbox.Root
		>
	{:else}
		<Checkbox.Root defaultChecked onCheckedChange={(next) => onChange?.(next)}
			>Notifications</Checkbox.Root
		>
	{/if}
{:else if part === 'toggle'}
	{#if mode === 'bind'}
		<Toggle bind:pressed onPressedChange={(next) => onChange?.(next)}>Bold</Toggle>
	{:else if mode === 'parent'}
		<button type="button" onclick={() => (pressed = true)}>Set value</button>
		<Toggle {pressed} onPressedChange={(next) => onChange?.(next)}>Bold</Toggle>
	{:else}
		<Toggle defaultPressed onPressedChange={(next) => onChange?.(next)}>Bold</Toggle>
	{/if}
{:else if part === 'collapsible'}
	{#if mode === 'bind'}
		<Collapsible.Root bind:open onOpenChange={(next) => onChange?.(next)}>
			<Collapsible.Trigger>Trigger</Collapsible.Trigger>
			<Collapsible.Panel>Panel</Collapsible.Panel>
		</Collapsible.Root>
	{:else if mode === 'parent'}
		<button type="button" onclick={() => (open = true)}>Set value</button>
		<Collapsible.Root {open} onOpenChange={(next) => onChange?.(next)}>
			<Collapsible.Trigger>Trigger</Collapsible.Trigger>
			<Collapsible.Panel>Panel</Collapsible.Panel>
		</Collapsible.Root>
	{:else}
		<Collapsible.Root defaultOpen onOpenChange={(next) => onChange?.(next)}>
			<Collapsible.Trigger>Trigger</Collapsible.Trigger>
			<Collapsible.Panel>Panel</Collapsible.Panel>
		</Collapsible.Root>
	{/if}
{:else if part === 'accordion'}
	{#if mode === 'bind'}
		<Accordion.Root bind:value={values} onValueChange={(next) => onChange?.(next)}>
			<Accordion.Item value="a">
				<Accordion.Header><Accordion.Trigger>Section</Accordion.Trigger></Accordion.Header>
				<Accordion.Panel>Panel</Accordion.Panel>
			</Accordion.Item>
		</Accordion.Root>
	{:else if mode === 'parent'}
		<button type="button" onclick={() => (values = ['a'])}>Set value</button>
		<Accordion.Root value={values} onValueChange={(next) => onChange?.(next)}>
			<Accordion.Item value="a">
				<Accordion.Header><Accordion.Trigger>Section</Accordion.Trigger></Accordion.Header>
				<Accordion.Panel>Panel</Accordion.Panel>
			</Accordion.Item>
		</Accordion.Root>
	{:else}
		<Accordion.Root defaultValue={['a']} onValueChange={(next) => onChange?.(next)}>
			<Accordion.Item value="a">
				<Accordion.Header><Accordion.Trigger>Section</Accordion.Trigger></Accordion.Header>
				<Accordion.Panel>Panel</Accordion.Panel>
			</Accordion.Item>
		</Accordion.Root>
	{/if}
{:else if part === 'toggle-group'}
	{#if mode === 'bind'}
		<ToggleGroup bind:value={strings} onValueChange={(next) => onChange?.(next)}>
			<Toggle value="a">A</Toggle>
		</ToggleGroup>
	{:else if mode === 'parent'}
		<button type="button" onclick={() => (strings = ['a'])}>Set value</button>
		<ToggleGroup value={strings} onValueChange={(next) => onChange?.(next)}>
			<Toggle value="a">A</Toggle>
		</ToggleGroup>
	{:else}
		<ToggleGroup defaultValue={['a']} onValueChange={(next) => onChange?.(next)}>
			<Toggle value="a">A</Toggle>
		</ToggleGroup>
	{/if}
{:else}
	{#if mode === 'bind'}
		<CheckboxGroup bind:value={strings} onValueChange={(next) => onChange?.(next)}>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if mode === 'parent'}
		<button type="button" onclick={() => (strings = ['a'])}>Set value</button>
		<CheckboxGroup value={strings} onValueChange={(next) => onChange?.(next)}>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else}
		<CheckboxGroup defaultValue={['a']} onValueChange={(next) => onChange?.(next)}>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{/if}
{/if}
