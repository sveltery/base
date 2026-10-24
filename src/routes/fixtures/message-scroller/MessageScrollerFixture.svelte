<script lang="ts">
	import { untrack } from 'svelte';
	import { MessageScroller } from '#lib';
	import { appended, initialMessages, viewportStyle, type MessageScrollerCase } from './cases.js';

	let { scenario }: { scenario: MessageScrollerCase } = $props();

	let messages = $state(untrack(() => initialMessages[scenario]));
</script>

<MessageScroller.Provider
	autoScroll={scenario === 'auto-scroll'}
	defaultScrollPosition={scenario === 'start'
		? 'start'
		: scenario === 'last-anchor'
			? 'last-anchor'
			: 'end'}
>
	<MessageScroller.Root data-testid="root">
		<MessageScroller.Viewport data-testid="viewport" style={viewportStyle}>
			<MessageScroller.Content data-testid="content">
				{#each messages as message (message.id)}
					<MessageScroller.Item
						messageId={message.id}
						scrollAnchor={message.scrollAnchor}
						style="height: {message.height}px">{message.id}</MessageScroller.Item
					>
				{/each}
			</MessageScroller.Content>
		</MessageScroller.Viewport>
		<MessageScroller.Button data-testid="start" direction="start" behavior="auto" />
		<MessageScroller.Button data-testid="end" behavior="auto" />
	</MessageScroller.Root>
</MessageScroller.Provider>
<button type="button" onclick={() => (messages = [...messages, ...appended(messages.length)])}
	>Append</button
>
