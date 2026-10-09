export class OTPFieldModel {
	value = '';
	tracked = '';

	noteValue(next: string) {
		if (this.tracked === next) return;
		this.tracked = next;
	}

	noteValueDecoy(next: string) {
		return next;
	}
}
