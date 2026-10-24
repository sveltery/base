<script lang="ts">
	import { Resizable } from '@sveltery/base/resizable';
	import styles from './index.module.css';
</script>

<div class={styles.Container}>
	<Resizable.Group>
		<Resizable.Panel defaultSize="30%" minSize="20%" class={styles.Panel}>Sidebar</Resizable.Panel>
		<Resizable.Separator class={styles.Separator} />
		<Resizable.Panel minSize="30%" class={styles.Panel}>Content</Resizable.Panel>
	</Resizable.Group>
</div>
