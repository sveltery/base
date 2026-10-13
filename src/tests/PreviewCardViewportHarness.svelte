<script lang="ts">
	import { DirectionProvider, PreviewCard } from '#lib';
	import type { PreviewCardChangeEventDetails, PreviewCardPositionerProps } from '#lib';

	interface TriggerSpec {
		id: string;
		payload?: string | number;
		testid: string;
		text: string;
		style?: string;
	}

	let {
		triggers = [{ id: 'trigger-1', payload: 'first', testid: 'trigger1', text: 'Trigger 1' }],
		open = $bindable(),
		triggerId = $bindable(),
		onOpenChange,
		keepMounted = false,
		side,
		collisionAvoidance,
		direction = 'ltr',
		content = 'payload',
		triggerKey = 'a'
	}: {
		triggers?: TriggerSpec[];
		open?: boolean;
		triggerId?: string | null;
		onOpenChange?: (open: boolean, details: PreviewCardChangeEventDetails) => void;
		keepMounted?: boolean;
		side?: PreviewCardPositionerProps['side'];
		collisionAvoidance?: PreviewCardPositionerProps['collisionAvoidance'];
		direction?: 'ltr' | 'rtl';
		content?: 'payload' | 'images' | 'static';
		triggerKey?: string;
	} = $props();
</script>

<DirectionProvider {direction}>
	<PreviewCard.Root bind:open bind:triggerId {onOpenChange}>
		{#snippet children({ payload })}
			{#each triggers as trigger (trigger.id)}
				{#key triggerKey}
					<PreviewCard.Trigger
						href="#"
						delay={0}
						id={trigger.id}
						payload={trigger.payload}
						data-testid={trigger.testid}
						style={trigger.style}
					>
						{trigger.text}
					</PreviewCard.Trigger>
				{/key}
			{/each}
			<PreviewCard.Portal {keepMounted}>
				<PreviewCard.Positioner {side} {collisionAvoidance}>
					<PreviewCard.Popup data-testid="popup">
						<PreviewCard.Viewport data-testid="viewport">
							{#if content === 'images'}
								{#if payload === 'first'}
									<img data-testid="payload-image-1" src="about:blank" alt="Preview 1" />
								{:else if payload === 'second'}
									<img data-testid="payload-image-2" src="about:blank" alt="Preview 2" />
								{/if}
							{:else if content === 'static'}
								<div data-testid="content">Content</div>
							{:else}
								<div data-testid="content">Content {payload}</div>
							{/if}
						</PreviewCard.Viewport>
					</PreviewCard.Popup>
				</PreviewCard.Positioner>
			</PreviewCard.Portal>
		{/snippet}
	</PreviewCard.Root>
</DirectionProvider>
