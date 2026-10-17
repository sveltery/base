<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';
	import styles from './index.module.css';

	const OTP_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;
</script>

<div class={styles.Field}>
	<label for={id} class={styles.Label}>Verification code</label>
	<OTPField.Root {id} length={OTP_LENGTH} aria-describedby={descriptionId} class={styles.Root}>
		{#each { length: OTP_LENGTH } as _, index (index)}
			<OTPField.Input
				class={styles.Input}
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${OTP_LENGTH}`}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class={styles.Description}>
		Enter the 6-character code we sent to your device.
	</p>
</div>
