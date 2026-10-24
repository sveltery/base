<!--
	The input-otp test app's BaseOTPInput: a bound value and slots drawn by `render`.
	Derived from input-otp v1.4.2 apps/test/src/components/base-input.tsx
	(commit 81ccdb48c010d800b24942aa231909f0c971b1ca). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { InputOTP, type InputOTPRootProps } from '../lib/input-otp/index.js';

	type Props = Partial<InputOTPRootProps> & {
		disableOnComplete?: boolean;
		'data-testid'?: string;
	};

	let { disableOnComplete = false, ...overrides }: Props = $props();

	let value = $state('');
	let disabled = $state(false);
</script>

<InputOTP.Root
	bind:value
	{disabled}
	maxlength={6}
	onComplete={disableOnComplete ? () => (disabled = true) : undefined}
	containerClass="group flex items-center"
	{...overrides}
>
	{#snippet render({ slots, isFocused, isHovering })}
		<div
			class="flex items-center gap-1"
			data-testid="input-otp-renderer"
			data-test-render-is-hovering={isHovering ? 'true' : undefined}
			data-test-render-is-focused={isFocused ? 'true' : undefined}
		>
			{#each slots as slot, index (index)}
				<div
					data-testid={`slot-${index}`}
					data-test-char={slot.char ?? undefined}
					data-test-active={slot.isActive ? 'true' : undefined}
					data-test-caret={slot.hasFakeCaret ? 'true' : undefined}
					style="width: 40px; height: 56px; border: 4px solid black"
				>
					{slot.char ?? slot.placeholderChar ?? ' '}
				</div>
			{/each}
		</div>
	{/snippet}
</InputOTP.Root>
<output data-testid="value">{value}</output>
