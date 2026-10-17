<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
	import styles from './index.module.css';
</script>

<Slider.Root defaultValue={[25, 45]}>
	<Slider.Control class={styles.Control}>
		<Slider.Track class={styles.Track}>
			<Slider.Indicator class={styles.Indicator} />
			<Slider.Thumb index={0} aria-label="Minimum value" class={styles.Thumb} />
			<Slider.Thumb index={1} aria-label="Maximum value" class={styles.Thumb} />
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
