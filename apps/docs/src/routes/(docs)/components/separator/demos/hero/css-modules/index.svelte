<script lang="ts">
	import { Separator } from '@sveltery/base/separator';
	import styles from './index.module.css';
</script>

<div class={styles.Container}>
	<a href="#top" class={styles.Link}>Home</a>
	<a href="#top" class={styles.Link}>Pricing</a>
	<a href="#top" class={styles.Link}>Blog</a>
	<a href="#top" class={styles.Link}>Support</a>

	<Separator orientation="vertical" class={styles.Separator} />

	<a href="#top" class={styles.Link}>Log in</a>
	<a href="#top" class={styles.Link}>Sign up</a>
</div>
