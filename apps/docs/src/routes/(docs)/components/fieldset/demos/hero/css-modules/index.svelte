<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import styles from './index.module.css';
</script>

<Fieldset.Root class={styles.Fieldset}>
	<Fieldset.Legend class={styles.Legend}>Billing details</Fieldset.Legend>

	<Field.Root class={styles.Field}>
		<Field.Label class={styles.Label}>Company</Field.Label>
		<Field.Control placeholder="Enter company name" class={styles.Input} />
	</Field.Root>

	<Field.Root class={styles.Field}>
		<Field.Label class={styles.Label}>Tax ID</Field.Label>
		<Field.Control placeholder="Enter fiscal number" class={styles.Input} />
	</Field.Root>
</Fieldset.Root>
