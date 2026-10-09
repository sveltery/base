let tracked = '';

export function noteValue(next: string) {
	if (tracked === next) return;
	tracked = next;
}
