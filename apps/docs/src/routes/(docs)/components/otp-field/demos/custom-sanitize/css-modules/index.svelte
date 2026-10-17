<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';
	import { useInvalidFeedback } from '../useInvalidFeedback.svelte.ts';
	import styles from './index.module.css';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;

	const feedback = useInvalidFeedback();

	const invalidClass = $derived(
		feedback.invalidPulse === 0
			? ''
			: feedback.invalidPulse % 2 === 0
				? styles.InputInvalidB
				: styles.InputInvalidA
	);

	function normalizeRecoveryCode(value: string) {
		return value.toUpperCase();
	}
</script>

<div class={styles.Field}>
	<label for={id} class={styles.Label}>Recovery code</label>
	<OTPField.Root
		{id}
		length={CODE_LENGTH}
		validationType="alphanumeric"
		normalizeValue={normalizeRecoveryCode}
		onValueChange={feedback.handleValueChange}
		onValueInvalid={feedback.handleValueInvalid}
		aria-describedby={descriptionId}
		class={styles.Root}
	>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class={[styles.Input, feedback.activeInvalidIndex === index && invalidClass]}
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
				onfocus={() => feedback.setFocusedIndex(index)}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class={styles.Description}>
		Letters and digits only. Letters are converted to uppercase.
	</p>
	<span aria-live="polite" class={styles.ScreenReaderOnly}>{feedback.statusMessage}</span>
</div>
