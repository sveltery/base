<script lang="ts">
	import { InputOTP, REGEXP_ONLY_DIGITS } from '@sveltery/base/input-otp';
	import styles from './index.module.css';
</script>

<InputOTP.Root
	maxlength={6}
	pattern={REGEXP_ONLY_DIGITS}
	aria-label="Verification code"
	containerClass={styles.Container}
>
	{#snippet render({ slots })}
		<div class={styles.Slots}>
			{#each slots as slot, index (index)}
				<div class={styles.Slot} data-active={slot.isActive || undefined}>
					{slot.char ?? slot.placeholderChar}
					{#if slot.hasFakeCaret}
						<div class={styles.Caret}></div>
					{/if}
				</div>
			{/each}
		</div>
	{/snippet}
</InputOTP.Root>
