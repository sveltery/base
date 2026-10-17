<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
	import styles from './index.module.css';

	const MIN = 0;
	const MAX = 100;
	const MARKS = [0, 25, 50, 75, 100];

	function valueToPercent(value: number) {
		return ((value - MIN) / (MAX - MIN)) * 100;
	}
</script>

<Slider.Root class={styles.Root} defaultValue={40} min={MIN} max={MAX}>
	<Slider.Control class={styles.Control}>
		<Slider.Track class={styles.Track}>
			<Slider.Indicator class={styles.Indicator} />
			{#each MARKS as mark (mark)}
				<div aria-hidden="true" class={styles.Mark} style:left="{valueToPercent(mark)}%"></div>
			{/each}
			<Slider.Thumb aria-label="Volume" class={styles.Thumb} />
		</Slider.Track>
	</Slider.Control>
	<div class={styles.MarkLabels} aria-hidden="true">
		{#each MARKS as mark (mark)}
			<span class={styles.MarkLabel} style:left="{valueToPercent(mark)}%">
				{mark}
			</span>
		{/each}
	</div>
</Slider.Root>
