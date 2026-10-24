// Derived from input-otp v1.4.2 packages/input-otp/src/input.tsx
// (commit 81ccdb48c010d800b24942aa231909f0c971b1ca). MIT, see THIRD_PARTY_NOTICES.md.

export const InputOTPRootDataAttributes = {
	/** Present on the container that holds the slots and the input. */
	container: 'data-input-otp-container',
	/** Present on the input. */
	input: 'data-input-otp',
	/** Present on the input while the value is empty. */
	placeholderShown: 'data-input-otp-placeholder-shown',
	/**
	 * The start of the selection the slots mirror, set on the input.
	 * @type {number}
	 */
	mirrorSelectionStart: 'data-input-otp-mss',
	/**
	 * The end of the selection the slots mirror, set on the input.
	 * @type {number}
	 */
	mirrorSelectionEnd: 'data-input-otp-mse'
} as const;

export const InputOTPRootCssVariables = {
	/**
	 * The height of the input, set on the container.
	 * @type {number}
	 */
	rootHeight: '--root-height'
} as const;
