<script lang="ts">
	import { MessageScroller } from '@sveltery/base/message-scroller';

	type Message = { id: string; author: 'user' | 'assistant'; text: string };

	let messages = $state<Message[]>([
		{ id: 'm1', author: 'user', text: 'What is vernacular architecture?' },
		{
			id: 'm2',
			author: 'assistant',
			text: 'Building done outside any academic tradition, without professional guidance. It covers a wide range of building types from around the world.'
		},
		{ id: 'm3', author: 'user', text: 'How much of the built world is it?' },
		{
			id: 'm4',
			author: 'assistant',
			text: 'Amos Rapoport estimated in 1995 that it makes up 95% of the built environment.'
		}
	]);

	function ask() {
		const turn = messages.length;
		messages.push(
			{ id: `m${turn + 1}`, author: 'user', text: 'Tell me more.' },
			{
				id: `m${turn + 2}`,
				author: 'assistant',
				text: 'It serves local needs, uses the materials of its region and reflects local traditions.'
			}
		);
	}
</script>

<div class="flex w-96 max-w-[calc(100vw-8rem)] flex-col gap-3">
	<MessageScroller.Provider autoScroll>
		<MessageScroller.Root
			class="relative h-48 rounded-md border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-950"
		>
			<MessageScroller.Viewport
				class="h-full overflow-y-auto rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 data-pending-scroll:invisible dark:focus-visible:outline-white"
			>
				<MessageScroller.Content class="flex flex-col gap-2 p-3">
					{#each messages as message (message.id)}
						<MessageScroller.Item
							class="max-w-[80%] rounded-md bg-neutral-100 px-3 py-2 text-sm text-neutral-950 data-[author=user]:self-end data-[author=user]:bg-neutral-950 data-[author=user]:text-white dark:bg-neutral-800 dark:text-white dark:data-[author=user]:bg-white dark:data-[author=user]:text-neutral-950"
							data-author={message.author}
							messageId={message.id}
							scrollAnchor={message.author === 'user'}
						>
							{message.text}
						</MessageScroller.Item>
					{/each}
				</MessageScroller.Content>
			</MessageScroller.Viewport>
			<MessageScroller.Button
				class="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-950 transition-opacity data-[active=false]:opacity-0 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
			/>
		</MessageScroller.Root>
	</MessageScroller.Provider>
	<button
		type="button"
		class="self-start rounded-md border border-neutral-300 bg-neutral-50 px-3.5 py-1.5 text-sm text-neutral-950 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
		onclick={ask}>Ask</button
	>
</div>
