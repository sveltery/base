<script lang="ts">
	import { Button } from '@sveltery/base/button';
	import styles from './index.module.css';

	let loading = $state(false);
	const labelId = $props.id();
</script>

<Button
	class={styles.Button}
	disabled={loading}
	focusableWhenDisabled
	aria-labelledby={labelId}
	onclick={() => {
		loading = true;
		setTimeout(() => {
			loading = false;
		}, 4000);
	}}
>
	<span id={labelId}>{loading ? 'Submitting' : 'Submit'}</span>
</Button>
