<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
	import styles from './index.module.css';

	const id = $props.id();
</script>

<RadioGroup aria-labelledby={id} defaultValue="fuji-apple" class={styles.RadioGroup}>
	<div class={styles.Caption} {id}>Best apple</div>

	<label class={styles.Item}>
		<Radio.Root value="fuji-apple" class={styles.Radio}>
			<Radio.Indicator class={styles.Indicator} />
		</Radio.Root>
		Fuji
	</label>

	<label class={styles.Item}>
		<Radio.Root value="gala-apple" class={styles.Radio}>
			<Radio.Indicator class={styles.Indicator} />
		</Radio.Root>
		Gala
	</label>

	<label class={styles.Item}>
		<Radio.Root value="granny-smith-apple" class={styles.Radio}>
			<Radio.Indicator class={styles.Indicator} />
		</Radio.Root>
		Granny Smith
	</label>
</RadioGroup>
