<script lang="ts">
	import { Popover } from '#lib';

	let {
		mode = 'lifecycle',
		rootMounted = true,
		portalIntoForm = false,
		requiredCopy = false,
		delay = 300
	}: {
		mode?: 'lifecycle' | 'form';
		rootMounted?: boolean;
		portalIntoForm?: boolean;
		requiredCopy?: boolean;
		delay?: number;
	} = $props();

	const handle = Popover.createHandle();
	let hostedForm = $state<HTMLFormElement | null>(null);
</script>

{#if mode === 'lifecycle'}
	<button type="button">Away</button>
	<Popover.Trigger {handle} openOnHover {delay}>Open</Popover.Trigger>
	{#if rootMounted}
		<Popover.Root {handle}>
			<Popover.Portal>
				<Popover.Positioner>
					<Popover.Popup>
						<button type="button">Inside</button>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	{/if}
{:else}
	<form id="outer-form" data-testid="outer-form"></form>
	<form id="hosted-form" data-testid="hosted-form" bind:this={hostedForm}></form>
	<Popover.Trigger {handle} id="trigger-a" payload="AAA">One</Popover.Trigger>
	<Popover.Trigger {handle} id="trigger-b" payload="BBB">Two</Popover.Trigger>
	<Popover.Root {handle}>
		{#snippet children({ payload })}
			<Popover.Portal container={portalIntoForm ? hostedForm : undefined}>
				<Popover.Positioner>
					<Popover.Popup>
						<Popover.Viewport>
							<input
								name="field"
								form={portalIntoForm ? undefined : 'outer-form'}
								data-testid="live-input"
								value={payload === 'AAA' ? 'AAA' : 'BBB'}
							/>
							{#if requiredCopy && payload === 'AAA'}
								<input required data-testid="required-copy" />
							{/if}
						</Popover.Viewport>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		{/snippet}
	</Popover.Root>
{/if}
