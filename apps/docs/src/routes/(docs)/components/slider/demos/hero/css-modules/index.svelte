<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
	import styles from './index.module.css';
</script>

<Slider.Root defaultValue={25}>
	<Slider.Control class={styles.Control}>
		<Slider.Track class={styles.Track}>
			<Slider.Indicator class={styles.Indicator} />
			<Slider.Thumb aria-label="Volume" class={styles.Thumb} />
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
