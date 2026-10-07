<script lang="ts">
	import { DirectionProvider, Toolbar } from '#lib';
	import type { ToolbarCase } from './cases.js';

	let { scenario }: { scenario: ToolbarCase } = $props();

	let clicks = $state(0);

	function countClick() {
		clicks += 1;
	}
</script>

<DirectionProvider direction={scenario === 'rtl' ? 'rtl' : 'ltr'}>
	<div dir={scenario === 'rtl' ? 'rtl' : 'ltr'}>
		{#if scenario === 'keyboard' || scenario === 'vertical' || scenario === 'rtl'}
			<Toolbar.Root
				aria-label="Tools"
				orientation={scenario === 'vertical' ? 'vertical' : 'horizontal'}
			>
				<Toolbar.Button>One</Toolbar.Button>
				<Toolbar.Link href="https://base-ui.com">Link</Toolbar.Link>
				<Toolbar.Group>
					<Toolbar.Button>Two</Toolbar.Button>
					<Toolbar.Button>Three</Toolbar.Button>
				</Toolbar.Group>
			</Toolbar.Root>
		{:else if scenario === 'loop'}
			<Toolbar.Root aria-label="Tools" loopFocus={false}>
				<Toolbar.Button>One</Toolbar.Button>
				<Toolbar.Button>Two</Toolbar.Button>
			</Toolbar.Root>
		{:else if scenario === 'disabled'}
			<Toolbar.Root aria-label="Tools" disabled>
				<Toolbar.Button>One</Toolbar.Button>
				<Toolbar.Link href="https://base-ui.com">Link</Toolbar.Link>
				<Toolbar.Group>
					<Toolbar.Button>Two</Toolbar.Button>
					<Toolbar.Link href="https://base-ui.com">Docs</Toolbar.Link>
				</Toolbar.Group>
			</Toolbar.Root>
		{:else if scenario === 'focusable'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button disabled>One</Toolbar.Button>
				<Toolbar.Button disabled>Two</Toolbar.Button>
				<Toolbar.Button disabled>Three</Toolbar.Button>
			</Toolbar.Root>
		{:else if scenario === 'skip'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button>One</Toolbar.Button>
				<Toolbar.Button disabled focusableWhenDisabled={false}>Two</Toolbar.Button>
				<Toolbar.Button>Three</Toolbar.Button>
			</Toolbar.Root>
		{:else if scenario === 'activate'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button onclick={countClick}>One</Toolbar.Button>
				<Toolbar.Button disabled onclick={countClick}>Two</Toolbar.Button>
			</Toolbar.Root>
			<output data-testid="clicks">{clicks}</output>
		{:else if scenario === 'custom'}
			<Toolbar.Root aria-label="Tools">
				<Toolbar.Button nativeButton={false} onclick={countClick}>
					{#snippet render(props)}
						<span {...props}>Save</span>
					{/snippet}
				</Toolbar.Button>
			</Toolbar.Root>
			<output data-testid="clicks">{clicks}</output>
		{/if}
	</div>
</DirectionProvider>
