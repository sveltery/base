<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white">
		Verification code
	</label>
	<OTPField.Root
		{id}
		length={CODE_LENGTH}
		aria-describedby={descriptionId}
		class="flex w-full gap-2"
	>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white focus:placeholder:text-transparent dark:border-white dark:text-white dark:placeholder:text-neutral-400"
				placeholder="•"
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class="m-0 text-sm text-neutral-600 dark:text-neutral-400">
		Placeholder hints can stay visible until the active slot is focused.
	</p>
</div>
