<script lang="ts">
	import { Meter } from '@sveltery/base/meter';
	import styles from './index.module.css';
</script>

<Meter.Root class={styles.Meter} value={24}>
	<Meter.Label class={styles.Label}>Storage Used</Meter.Label>
	<Meter.Value class={styles.Value} />
	<Meter.Track class={styles.Track}>
		<Meter.Indicator class={styles.Indicator} />
	</Meter.Track>
</Meter.Root>
