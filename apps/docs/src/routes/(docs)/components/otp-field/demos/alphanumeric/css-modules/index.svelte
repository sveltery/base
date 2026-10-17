<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';
	import styles from './index.module.css';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;
</script>

<div class={styles.Field}>
	<label for={id} class={styles.Label}>Recovery code</label>
	<OTPField.Root
		{id}
		length={CODE_LENGTH}
		validationType="alphanumeric"
		aria-describedby={descriptionId}
		class={styles.Root}
	>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class={styles.Input}
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class={styles.Description}>
		Accept letters and numbers for backup codes such as <span class={styles.Code}>A7C9XZ</span>.
	</p>
</div>
