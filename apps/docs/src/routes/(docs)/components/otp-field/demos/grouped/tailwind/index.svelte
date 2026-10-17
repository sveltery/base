<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const OTP_LENGTH = 6;
	const id = $props.id();
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white">
		Verification code
	</label>
	<OTPField.Root {id} length={OTP_LENGTH} class="flex w-full items-center gap-2">
		<div class="flex gap-2">
			{#each { length: 3 } as _, index (index)}
				<OTPField.Input
					class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
					aria-label={index === 0 ? undefined : `Character ${index + 1} of ${OTP_LENGTH}`}
				/>
			{/each}
		</div>
		<OTPField.Separator class="h-px w-4 bg-current text-neutral-950 dark:text-white" />
		<div class="flex gap-2">
			{#each { length: 3 } as _, index (index)}
				<OTPField.Input
					class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
					aria-label={`Character ${index + 4} of ${OTP_LENGTH}`}
				/>
			{/each}
		</div>
	</OTPField.Root>
</div>
