export function useInvalidFeedback() {
	let focusedIndex = $state(0);
	let invalidPulse = $state(0);
	let statusMessage = $state('');
	let invalidTimeout: ReturnType<typeof setTimeout> | undefined;
	let skipClearOnNextValueChange = false;

	$effect(() => () => clearTimeout(invalidTimeout));

	return {
		get activeInvalidIndex() {
			return invalidPulse > 0 ? focusedIndex : -1;
		},
		get invalidPulse() {
			return invalidPulse;
		},
		get statusMessage() {
			return statusMessage;
		},
		setFocusedIndex(index: number) {
			focusedIndex = index;
		},
		handleValueChange() {
			if (skipClearOnNextValueChange) {
				skipClearOnNextValueChange = false;
				return;
			}
			clearTimeout(invalidTimeout);
			invalidPulse = 0;
			statusMessage = '';
		},
		handleValueInvalid(value: string) {
			skipClearOnNextValueChange = true;
			invalidPulse += 1;
			statusMessage = `Unsupported characters were ignored from ${value}.`;
			clearTimeout(invalidTimeout);
			invalidTimeout = setTimeout(() => {
				invalidPulse = 0;
			}, 400);
		}
	};
}
