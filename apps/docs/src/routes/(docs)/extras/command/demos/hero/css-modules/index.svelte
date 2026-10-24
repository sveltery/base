<script lang="ts">
	import { Command } from '@sveltery/base/command';
	import styles from './index.module.css';
</script>

<Command.Root label="Command menu" class={styles.Root}>
	<Command.Input placeholder="Type a command or search..." class={styles.Input} />
	<Command.List class={styles.List}>
		<Command.Empty class={styles.Empty}>No results found.</Command.Empty>
		<Command.Group heading="Suggestions" class={styles.Group}>
			<Command.Item class={styles.Item}>Calendar</Command.Item>
			<Command.Item class={styles.Item} keywords={['emoji']}>Search Emoji</Command.Item>
			<Command.Item class={styles.Item} disabled>Calculator</Command.Item>
		</Command.Group>
		<Command.Separator class={styles.Separator} />
		<Command.Group heading="Settings" class={styles.Group}>
			<Command.Item class={styles.Item}>Profile</Command.Item>
			<Command.Item class={styles.Item}>Billing</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Root>
