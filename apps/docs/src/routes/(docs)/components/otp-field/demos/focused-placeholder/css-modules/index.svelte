<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';
	import styles from './index.module.css';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;
</script>

<div class={styles.Field}>
	<label for={id} class={styles.Label}>Verification code</label>
	<OTPField.Root {id} length={CODE_LENGTH} aria-describedby={descriptionId} class={styles.Root}>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class={styles.Input}
				placeholder="•"
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class={styles.Description}>
		Placeholder hints can stay visible until the active slot is focused.
	</p>
</div>
