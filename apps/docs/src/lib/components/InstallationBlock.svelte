<script module lang="ts">
	const MANAGERS = [
		{ value: 'pnpm', command: 'add' },
		{ value: 'npm', command: 'i' },
		{ value: 'yarn', command: 'add' },
		{ value: 'bun', command: 'add' }
	] as const;
	const STORAGE_KEY = 'package-manager';
</script>

<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';
	import CopyButton from './CopyButton.svelte';

	let { package: name }: { package: string } = $props();
	let value = $state<string>(MANAGERS[0].value);

	// The choice is shared across pages, as Base UI's package manager preference is.
	$effect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (MANAGERS.some((manager) => manager.value === saved)) value = saved!;
		} catch {
			// Storage can be blocked. The first tab stays selected.
		}
	});

	function select(next: string) {
		value = next;
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Storage can be blocked. The choice lasts for this page only.
		}
	}

	const command = $derived(MANAGERS.find((manager) => manager.value === value)!);
</script>

<Tabs.Root class="InstallationBlock" bind:value={() => value, select}>
	<figure class="CodeBlockRoot MdFigure" aria-label="Installation command">
		<div class="CodeBlockPanel">
			<Tabs.List class="InstallationBlockTabsList" aria-label="Package manager" activateOnFocus>
				{#each MANAGERS as manager (manager.value)}
					<Tabs.Tab value={manager.value} class="InstallationBlockTab">
						<span>{manager.value}</span>
					</Tabs.Tab>
				{/each}
			</Tabs.List>
			<CopyButton text={() => `${command.value} ${command.command} ${name}`} />
		</div>
		{#each MANAGERS as manager (manager.value)}
			<Tabs.Panel value={manager.value} class="InstallationBlockTabPanel">
				<pre class="CodeBlockPreInline CodeBlockPre"><code class="Code"
						><span class="line"
							><span class="pl-en">{manager.value}</span> <span class="pl-smi">{manager.command}</span> <span
								class="pl-s">{name}</span
							></span
						></code
					></pre>
			</Tabs.Panel>
		{/each}
	</figure>
</Tabs.Root>
