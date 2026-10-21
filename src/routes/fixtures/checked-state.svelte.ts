export type CheckedCall = { checked: boolean; reason: string; canceled: boolean };

type CheckedDetails = { reason: string; isCanceled: boolean; cancel: () => void };

export class CheckedFixture {
	owner = $state(false);
	checked = $state(false);
	calls = $state<CheckedCall[]>([]);
	values = $state<(string | null)[]>([]);

	constructor(private readonly scenario: () => string) {}

	changed = (next: boolean, details: CheckedDetails) => {
		if (this.scenario() === 'cancel') details.cancel();
		this.calls.push({ checked: next, reason: details.reason, canceled: details.isCanceled });
	};

	prevent = (event: MouseEvent) => {
		if (this.scenario() === 'prevented') event.preventDefault();
	};

	/**
	 * The Svelte controls are native inputs: a click handler that cancels stands in for
	 * `onCheckedChange` with `cancel()`, and `change` reports a change that went through.
	 */
	clicked = (event: MouseEvent) => {
		const scenario = this.scenario();
		if (scenario === 'prevented') event.preventDefault();
		if (scenario !== 'cancel') return;
		const target = event.currentTarget as HTMLInputElement;
		this.calls.push({ checked: target.checked, reason: 'none', canceled: true });
		event.preventDefault();
	};

	inputChanged = (event: Event) => {
		const target = event.currentTarget as HTMLInputElement;
		this.calls.push({ checked: target.checked, reason: 'none', canceled: false });
	};

	submitted = (event: SubmitEvent) => {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const value = new FormData(form).get('notifications');
		this.values.push(typeof value === 'string' ? value : null);
	};
}
