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
		mode: 'bind' | 'parent' | 'default' | 'journal' | 'copy' | 'confirm';
		onChange?: (value: unknown) => void;
	} = $props();

	let checked = $state<boolean | undefined>(
		(mode === 'journal' && (part === 'switch' || part === 'checkbox')) || mode === 'confirm'
			? false
			: undefined
	);
	let pressed = $state<boolean | undefined>(
		mode === 'journal' && part === 'toggle' ? false : undefined
	);
	let open = $state<boolean | undefined>(
		mode === 'journal' && part === 'collapsible' ? false : undefined
	);
	let values = $state<unknown[] | undefined>(
		part === 'accordion' && (mode === 'journal' || mode === 'copy') ? [] : undefined
	);
	let strings = $state<string[] | undefined>(
		(part === 'toggle-group' || part === 'checkbox-group') &&
			(mode === 'journal' || mode === 'copy')
			? []
			: undefined
	);
	let log = $state('');
	let copies = $state(0);
	let prompts = $state(0);

	function record(value: unknown, details: { reason: string }) {
		const text = Array.isArray(value) ? value.map(String).join(',') : String(value);
		const line = `${text}:${details.reason}`;
		log = log ? `${log}|${line}` : line;
		onChange?.(value);
	}

	function rememberCopy(next: readonly unknown[]) {
		copies += 1;
		const copy = [...next];
		if (part === 'accordion') values = copy;
		else strings = copy.map(String);
	}

	function turn(on: boolean) {
		if (part === 'switch' || part === 'checkbox') checked = on;
		else if (part === 'toggle') pressed = on;
		else if (part === 'collapsible') open = on;
		else if (part === 'accordion') values = on ? ['a'] : [];
		else strings = on ? ['a'] : [];
	}

	function confirmChecked(next: boolean, details: { cancel: () => void }) {
		details.cancel();
		prompts += 1;
		setTimeout(() => {
			checked = next;
		}, 0);
	}

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
<output data-testid="log">{log}</output>
<output data-testid="copies">{copies}</output>
<output data-testid="prompts">{prompts}</output>

{#if part === 'switch'}
	{#if mode === 'bind'}
		<Switch.Root bind:checked onCheckedChange={(next) => onChange?.(next)}
			>Notifications</Switch.Root
		>
	{:else if mode === 'parent'}
		<button type="button" onclick={() => (checked = true)}>Set value</button>
		<Switch.Root {checked} onCheckedChange={(next) => onChange?.(next)}>Notifications</Switch.Root>
	{:else if mode === 'journal'}
		<button type="button" onclick={() => turn(true)}>Set value</button>
		<button type="button" onclick={() => turn(false)}>Unset value</button>
		<Switch.Root {checked} onCheckedChange={record}>Notifications</Switch.Root>
	{:else if mode === 'confirm'}
		<Switch.Root {checked} onCheckedChange={confirmChecked}>Notifications</Switch.Root>
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
	{:else if mode === 'journal'}
		<button type="button" onclick={() => turn(true)}>Set value</button>
		<button type="button" onclick={() => turn(false)}>Unset value</button>
		<Checkbox.Root {checked} onCheckedChange={record}>Notifications</Checkbox.Root>
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
	{:else if mode === 'journal'}
		<button type="button" onclick={() => turn(true)}>Set value</button>
		<button type="button" onclick={() => turn(false)}>Unset value</button>
		<Toggle {pressed} onPressedChange={record}>Bold</Toggle>
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
	{:else if mode === 'journal'}
		<button type="button" onclick={() => turn(true)}>Set value</button>
		<button type="button" onclick={() => turn(false)}>Unset value</button>
		<Collapsible.Root {open} onOpenChange={record}>
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
	{:else if mode === 'journal'}
		<button type="button" onclick={() => turn(true)}>Set value</button>
		<button type="button" onclick={() => turn(false)}>Unset value</button>
		<Accordion.Root value={values} onValueChange={record}>
			<Accordion.Item value="a">
				<Accordion.Header><Accordion.Trigger>Section</Accordion.Trigger></Accordion.Header>
				<Accordion.Panel>Panel</Accordion.Panel>
			</Accordion.Item>
		</Accordion.Root>
	{:else if mode === 'copy'}
		<button type="button" onclick={() => (values = ['a'])}>Set value</button>
		<Accordion.Root value={values} onValueChange={(next) => rememberCopy(next)}>
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
	{:else if mode === 'journal'}
		<button type="button" onclick={() => turn(true)}>Set value</button>
		<button type="button" onclick={() => turn(false)}>Unset value</button>
		<ToggleGroup value={strings} onValueChange={record}>
			<Toggle value="a">A</Toggle>
		</ToggleGroup>
	{:else if mode === 'copy'}
		<button type="button" onclick={() => (strings = ['b'])}>Set value</button>
		<ToggleGroup value={strings} onValueChange={(next) => rememberCopy(next)}>
			<Toggle value="a">A</Toggle>
			<Toggle value="b">B</Toggle>
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
	{:else if mode === 'journal'}
		<button type="button" onclick={() => turn(true)}>Set value</button>
		<button type="button" onclick={() => turn(false)}>Unset value</button>
		<CheckboxGroup value={strings} onValueChange={record}>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if mode === 'copy'}
		<button type="button" onclick={() => (strings = ['a'])}>Set value</button>
		<CheckboxGroup value={strings} onValueChange={(next) => rememberCopy(next)}>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else}
		<CheckboxGroup defaultValue={['a']} onValueChange={(next) => onChange?.(next)}>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{/if}
{/if}
