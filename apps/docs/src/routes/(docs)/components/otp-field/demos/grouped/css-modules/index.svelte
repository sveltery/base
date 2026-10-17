<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';
	import styles from './index.module.css';

	const OTP_LENGTH = 6;
	const id = $props.id();
</script>

<div class={styles.Field}>
	<label for={id} class={styles.Label}>Verification code</label>
	<OTPField.Root {id} length={OTP_LENGTH} class={styles.Root}>
		<div class={styles.Group}>
			{#each { length: 3 } as _, index (index)}
				<OTPField.Input
					class={styles.Input}
					aria-label={index === 0 ? undefined : `Character ${index + 1} of ${OTP_LENGTH}`}
				/>
			{/each}
		</div>
		<OTPField.Separator class={styles.Separator} />
		<div class={styles.Group}>
			{#each { length: 3 } as _, index (index)}
				<OTPField.Input
					class={styles.Input}
					aria-label={`Character ${index + 4} of ${OTP_LENGTH}`}
				/>
			{/each}
		</div>
	</OTPField.Root>
</div>
