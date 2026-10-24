<script lang="ts">
	import { DayPicker } from '@sveltery/base/day-picker';
	import styles from './index.module.css';

	let selected = $state<Date>();
</script>

<DayPicker
	mode="single"
	bind:selected
	class={styles.Root}
	classNames={{
		month_caption: styles.Caption,
		nav: styles.Nav,
		button_previous: styles.NavButton,
		button_next: styles.NavButton,
		chevron: styles.Chevron,
		weekday: styles.Weekday,
		day: styles.Day,
		day_button: styles.DayButton,
		today: styles.Today,
		selected: styles.Selected
	}}
/>
