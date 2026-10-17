<script lang="ts">
	import { Progress } from '@sveltery/base/progress';
	import styles from './index.module.css';

	let value = $state(20);

	// Simulate changes
	$effect(() => {
		const interval = setInterval(() => {
			value = Math.min(100, Math.round(value + Math.random() * 25));
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<Progress.Root class={styles.Progress} {value}>
	<Progress.Label class={styles.Label}>Export data</Progress.Label>
	<Progress.Value class={styles.Value} />
	<Progress.Track class={styles.Track}>
		<Progress.Indicator class={styles.Indicator} />
	</Progress.Track>
</Progress.Root>
