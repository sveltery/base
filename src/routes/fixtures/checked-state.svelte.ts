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

	submitted = (event: SubmitEvent) => {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const value = new FormData(form).get('notifications');
		this.values.push(typeof value === 'string' ? value : null);
	};
}
