<script lang="ts">
	import { InputOTP, REGEXP_ONLY_DIGITS } from '@sveltery/base/input-otp';
</script>

<InputOTP.Root
	maxlength={6}
	pattern={REGEXP_ONLY_DIGITS}
	aria-label="Verification code"
	containerClass="flex items-center has-disabled:opacity-50"
>
	{#snippet render({ slots })}
		<div class="flex items-center gap-2">
			{#each slots as slot, index (index)}
				<div
					data-active={slot.isActive || undefined}
					class="relative flex h-10 w-10 items-center justify-center border border-neutral-950 bg-white text-base text-neutral-950 data-active:outline-2 data-active:-outline-offset-1 data-active:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:data-active:outline-white"
				>
					{slot.char ?? slot.placeholderChar}
					{#if slot.hasFakeCaret}
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div class="h-5 w-px animate-pulse bg-neutral-950 dark:bg-white"></div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/snippet}
</InputOTP.Root>
