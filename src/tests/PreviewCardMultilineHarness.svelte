<script lang="ts">
	import { PreviewCard } from '#lib';
	import type { PreviewCardChangeEventDetails, PreviewCardPositionerProps } from '#lib';

	let {
		scenario = 'uncontrolled',
		delay = 0,
		closeDelay,
		side = 'bottom',
		sideOffset = 5,
		open: openProp,
		popupClass,
		popupTestId = 'popup'
	}: {
		scenario?:
			| 'uncontrolled'
			| 'controlled-buttons'
			| 'switch'
			| 'custom-anchor'
			| 'focus'
			| 'focus-controlled';
		delay?: number;
		closeDelay?: number;
		side?: PreviewCardPositionerProps['side'];
		sideOffset?: PreviewCardPositionerProps['sideOffset'];
		open?: boolean;
		popupClass?: string;
		popupTestId?: string;
	} = $props();

	const LONG_TEXT =
		'This is a long text that will wrap across multiple lines in the trigger element';
	const inlineTrigger = 'display: inline; line-height: 20px; pointer-events: none';

	let open = $state<boolean | undefined>(undefined);
	let triggerId = $state<string | null | undefined>(undefined);
	let anchorTrigger = $state<HTMLElement | null>(null);
	let portalContainer = $state<HTMLElement | null>(null);

	function track(nextOpen: boolean, details: PreviewCardChangeEventDetails) {
		open = nextOpen;
		triggerId = details.trigger?.id ?? null;
	}

	function trackFocus(nextOpen: boolean, details: PreviewCardChangeEventDetails) {
		if (details.reason !== 'trigger-focus') {
			details.cancel();
			return;
		}
		track(nextOpen, details);
	}
</script>

{#snippet popup(keepMounted = false)}
	<PreviewCard.Portal {keepMounted}>
		<PreviewCard.Positioner data-testid="positioner" {side} {sideOffset}>
			<PreviewCard.Popup
				data-testid={popupTestId}
				class={popupClass}
				style="width: 80px; height: 40px"
			>
				Preview Content
			</PreviewCard.Popup>
		</PreviewCard.Positioner>
	</PreviewCard.Portal>
{/snippet}

{#if scenario === 'uncontrolled'}
	<div style="width: 140px">
		<PreviewCard.Root open={openProp}>
			<PreviewCard.Trigger {delay} {closeDelay} data-testid="trigger" style={inlineTrigger}>
				{LONG_TEXT}
			</PreviewCard.Trigger>
			{@render popup()}
		</PreviewCard.Root>
	</div>
{:else if scenario === 'controlled-buttons'}
	<div style="width: 140px">
		<PreviewCard.Root bind:open bind:triggerId onOpenChange={track}>
			<PreviewCard.Trigger {delay} data-testid="trigger" id="trigger" style={inlineTrigger}>
				{LONG_TEXT}
			</PreviewCard.Trigger>
			{@render popup(true)}
		</PreviewCard.Root>
		<button
			type="button"
			onclick={() => {
				triggerId = 'trigger';
				open = true;
			}}
		>
			Open
		</button>
		<button type="button" onclick={() => (open = false)}>Close</button>
	</div>
{:else if scenario === 'switch'}
	<div>
		<PreviewCard.Root bind:open bind:triggerId onOpenChange={track}>
			<PreviewCard.Trigger
				href="#"
				id="trigger-1"
				data-testid="trigger-1"
				delay={0}
				style="display: inline; pointer-events: none"
			>
				Trigger 1
			</PreviewCard.Trigger>
			<PreviewCard.Trigger
				href="#"
				id="trigger-2"
				data-testid="trigger-2"
				delay={0}
				style="display: inline; pointer-events: none"
			>
				Trigger 2
			</PreviewCard.Trigger>
			{@render popup()}
		</PreviewCard.Root>
		<button
			type="button"
			onclick={() => {
				open = true;
				triggerId = 'trigger-2';
			}}
		>
			Switch
		</button>
	</div>
{:else if scenario === 'custom-anchor'}
	<div>
		<div bind:this={portalContainer} data-testid="portal-container"></div>
		<PreviewCard.Root>
			<PreviewCard.Trigger
				href="#"
				delay={0}
				data-testid="trigger"
				style="pointer-events: none"
				{@attach (node) => {
					anchorTrigger = node;
				}}
			>
				Trigger
			</PreviewCard.Trigger>
			<PreviewCard.Portal keepMounted container={portalContainer}>
				<PreviewCard.Positioner
					anchor={() => anchorTrigger}
					collisionBoundary={{ x: 0, y: 0, width: 300, height: 120 }}
					collisionPadding={0}
					data-testid="positioner"
					side="bottom"
					sideOffset={5}
				>
					<PreviewCard.Popup style="width: 80px; height: 40px">Preview Content</PreviewCard.Popup>
				</PreviewCard.Positioner>
			</PreviewCard.Portal>
		</PreviewCard.Root>
	</div>
{:else if scenario === 'focus'}
	<div style="width: 140px; margin-top: 100px">
		<PreviewCard.Root>
			<PreviewCard.Trigger {delay} data-testid="trigger" tabindex={0} style={inlineTrigger}>
				{LONG_TEXT}
			</PreviewCard.Trigger>
			{@render popup()}
		</PreviewCard.Root>
	</div>
{:else}
	<div style="width: 140px; margin-top: 100px">
		<PreviewCard.Root bind:open bind:triggerId onOpenChange={trackFocus}>
			<PreviewCard.Trigger
				{delay}
				data-testid="trigger"
				id="trigger"
				tabindex={0}
				style={inlineTrigger}
			>
				{LONG_TEXT}
			</PreviewCard.Trigger>
			{@render popup(true)}
		</PreviewCard.Root>
	</div>
{/if}
