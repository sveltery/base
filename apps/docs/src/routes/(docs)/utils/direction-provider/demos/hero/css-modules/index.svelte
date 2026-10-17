<script lang="ts">
	import { DirectionProvider } from '@sveltery/base/direction-provider';
	import { Slider } from '@sveltery/base/slider';
	import styles from './index.module.css';
</script>

<div dir="rtl">
	<DirectionProvider direction="rtl">
		<Slider.Root defaultValue={25}>
			<Slider.Control class={styles.Control}>
				<Slider.Track class={styles.Track}>
					<Slider.Indicator class={styles.Indicator} />
					<Slider.Thumb aria-label="Volume" class={styles.Thumb} />
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	</DirectionProvider>
</div>
