<script lang="ts">
	import { Textarea } from '@sveltery/base/textarea';
	import styles from './index.module.css';
</script>

<label class={styles.Label}>
	Message
	<Textarea placeholder="Write a message" rows={3} class={styles.Textarea} />
</label>
