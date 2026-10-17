<script lang="ts">
	import { Collapsible } from '@sveltery/base/collapsible';
	import styles from './index.module.css';
</script>

<Collapsible.Root class={styles.Collapsible}>
	<Collapsible.Trigger class={styles.Trigger}>
		Recovery keys
		{@render caretRightIcon()}
	</Collapsible.Trigger>
	<Collapsible.Panel class={styles.Panel}>
		<div class={styles.Content}>
			<div>alien-bean-pasta</div>
			<div>wild-irish-burrito</div>
			<div>horse-battery-staple</div>
		</div>
	</Collapsible.Panel>
</Collapsible.Root>

{#snippet caretRightIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		class={styles.Icon}
		style="display: block"
	>
		<path d="M6 12V4l4.5 4z" />
	</svg>
{/snippet}
