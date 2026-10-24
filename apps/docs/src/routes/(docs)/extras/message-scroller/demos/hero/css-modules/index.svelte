<script lang="ts">
	import { MessageScroller } from '@sveltery/base/message-scroller';
	import styles from './index.module.css';

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

<div class={styles.Container}>
	<MessageScroller.Provider autoScroll>
		<MessageScroller.Root class={styles.Root}>
			<MessageScroller.Viewport class={styles.Viewport}>
				<MessageScroller.Content class={styles.Content}>
					{#each messages as message (message.id)}
						<MessageScroller.Item
							class={styles.Item}
							data-author={message.author}
							messageId={message.id}
							scrollAnchor={message.author === 'user'}
						>
							{message.text}
						</MessageScroller.Item>
					{/each}
				</MessageScroller.Content>
			</MessageScroller.Viewport>
			<MessageScroller.Button class={styles.Button} />
		</MessageScroller.Root>
	</MessageScroller.Provider>
	<button type="button" class={styles.Ask} onclick={ask}>Ask</button>
</div>
