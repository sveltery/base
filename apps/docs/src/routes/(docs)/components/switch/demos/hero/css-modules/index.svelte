<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
	import styles from './index.module.css';
</script>

<label class={styles.Label}>
	<Switch.Root defaultChecked class={styles.Switch}>
		<Switch.Thumb class={styles.Thumb} />
	</Switch.Root>
	Notifications
</label>
