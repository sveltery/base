import type { RadioGroupCase } from './radio-group/cases.js';
import type { TabsCase } from './tabs/cases.js';
import type { ToggleGroupCase } from './toggle-group/cases.js';

type ChangeDetails = { reason: string; cancel: () => void; isCanceled: boolean };

function remember<T>(
	calls: { value: T; reason: string; canceled: boolean }[],
	value: T,
	details: ChangeDetails,
	cancel: boolean
) {
	if (cancel) details.cancel();
	return [...calls, { value, reason: details.reason, canceled: details.isCanceled }];
}

export class RadioGroupFixtureModel {
	value = $state<string | undefined>(undefined);
	calls = $state<{ value: string; reason: string; canceled: boolean }[]>([]);
	submitted = $state(0);
	readonly labels = ['A', 'B', 'C'] as const;
	readonly itemValues = ['a', 'b', 'c'] as const;

	constructor(private readonly scenario: () => RadioGroupCase) {}

	get count() {
		const scenario = this.scenario();
		return scenario === 'keyboard' || scenario === 'rtl' ? 3 : 2;
	}

	onValueChange = (next: unknown, details: ChangeDetails) => {
		const text = typeof next === 'string' ? next : '';
		this.calls = remember(this.calls, text, details, this.scenario() === 'cancel');
	};

	toggleOwner = () => {
		this.value = this.value === 'b' ? undefined : 'b';
	};

	onsubmit = (event: SubmitEvent) => {
		event.preventDefault();
		this.submitted += 1;
	};
}

export class TabsFixtureModel {
	value = $state<number | null>(null);
	calls = $state<{ value: unknown; reason: string; canceled: boolean }[]>([]);
	readonly labels = ['One', 'Two', 'Three'];

	constructor(private readonly scenario: () => TabsCase) {
		this.value = scenario() === 'bound' ? 0 : null;
	}

	get count() {
		const scenario = this.scenario();
		return scenario === 'keyboard' ||
			scenario === 'vertical' ||
			scenario === 'rtl' ||
			scenario === 'loop'
			? 3
			: 2;
	}

	get orientation() {
		return this.scenario() === 'vertical' ? 'vertical' : 'horizontal';
	}

	onValueChange = (next: unknown, details: ChangeDetails) => {
		const scenario = this.scenario();
		this.calls = remember(
			this.calls,
			next,
			details,
			scenario === 'cancel' && details.reason === 'none'
		);
		if (scenario === 'bound' && !details.isCanceled) this.value = next as number;
	};

	toggleOwner = () => {
		this.value = this.value === 1 ? 0 : 1;
	};
}

export class ToggleGroupFixtureModel {
	value = $state<string[]>([]);
	calls = $state<{ value: string[]; reason: string; canceled: boolean }[]>([]);

	constructor(private readonly scenario: () => ToggleGroupCase) {}

	get orientation() {
		return this.scenario() === 'vertical' ? 'vertical' : 'horizontal';
	}

	get count() {
		const scenario = this.scenario();
		return scenario === 'keyboard' || scenario === 'rtl' || scenario === 'vertical' ? 3 : 2;
	}

	onValueChange = (next: string[], details: ChangeDetails) => {
		const scenario = this.scenario();
		this.calls = remember(this.calls, next, details, scenario === 'cancel');
		if (scenario === 'bound' && !details.isCanceled) this.value = next;
	};

	toggleOwner = () => {
		this.value = this.value.includes('two') ? [] : ['two'];
	};
}
