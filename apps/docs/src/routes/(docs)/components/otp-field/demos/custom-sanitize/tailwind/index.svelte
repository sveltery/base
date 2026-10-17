<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;

	let focusedIndex = $state(0);
	let invalidPulse = $state(0);
	let statusMessage = $state('');
	let invalidTimeout: ReturnType<typeof setTimeout> | undefined;
	let skipClearOnNextValueChange = false;

	$effect(() => () => clearTimeout(invalidTimeout));

	function normalizeRecoveryCode(value: string) {
		return value.toUpperCase();
	}

	function handleValueChange() {
		if (skipClearOnNextValueChange) {
			skipClearOnNextValueChange = false;
			return;
		}
		clearTimeout(invalidTimeout);
		invalidPulse = 0;
		statusMessage = '';
	}

	function handleValueInvalid(value: string) {
		skipClearOnNextValueChange = true;
		invalidPulse += 1;
		statusMessage = `Unsupported characters were ignored from ${value}.`;
		clearTimeout(invalidTimeout);
		invalidTimeout = setTimeout(() => {
			invalidPulse = 0;
		}, 400);
	}

	function invalidClass(index: number) {
		if (invalidPulse === 0 || focusedIndex !== index) return '';
		return invalidPulse % 2 === 0
			? 'border-red-700! outline-2 -outline-offset-1 outline-red-700! focus:outline-red-700! dark:border-red-400! dark:outline-red-400! dark:focus:outline-red-400! animate-[otp-field-shake-b_180ms_ease-in-out]'
			: 'border-red-700! outline-2 -outline-offset-1 outline-red-700! focus:outline-red-700! dark:border-red-400! dark:outline-red-400! dark:focus:outline-red-400! animate-[otp-field-shake-a_180ms_ease-in-out]';
	}
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white"> Recovery code </label>
	<OTPField.Root
		{id}
		length={CODE_LENGTH}
		validationType="alphanumeric"
		normalizeValue={normalizeRecoveryCode}
		onValueChange={handleValueChange}
		onValueInvalid={handleValueInvalid}
		aria-describedby={descriptionId}
		class="flex w-full gap-2"
	>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white {invalidClass(
					index
				)}"
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
				onfocus={() => (focusedIndex = index)}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class="m-0 text-sm text-neutral-600 dark:text-neutral-400">
		Letters and digits only. Letters are converted to uppercase.
	</p>
	<span aria-live="polite" class="sr-only">{statusMessage}</span>
</div>

<style>
	@keyframes -global-otp-field-shake-a {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}

	@keyframes -global-otp-field-shake-b {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}
</style>
