// State owner for Base UI v1.8.0 packages/react/src/progress/root/ProgressRootContext.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// React context plus `useRegisteredLabelId`'s functional clear is a class: parts read live
// derived progress fields, and label registration updates `labelId`.

import { getContext, setContext } from 'svelte';
import { computeProgress, type ProgressInputs } from './compute.js';
import type { ProgressState } from './types.js';

const PROGRESS_ROOT_CONTEXT = Symbol('progress-root');

export class ProgressRootContext {
	value = $state<number | null>(null);
	min = $state(0);
	max = $state(100);
	format = $state<Intl.NumberFormatOptions | undefined>(undefined);
	locale = $state<Intl.LocalesArgument | undefined>(undefined);
	labelId = $state<string | undefined>(undefined);

	computed = $derived(
		computeProgress({
			value: this.value,
			min: this.min,
			max: this.max,
			format: this.format,
			locale: this.locale
		})
	);

	constructor(initial: ProgressInputs) {
		this.sync(initial);
	}

	sync(input: ProgressInputs) {
		this.value = input.value;
		this.min = input.min;
		this.max = input.max;
		this.format = input.format;
		this.locale = input.locale;
	}

	get state(): ProgressState {
		return { status: this.computed.status };
	}

	setLabelId(next: string | undefined | ((current: string | undefined) => string | undefined)) {
		this.labelId = typeof next === 'function' ? next(this.labelId) : next;
	}
}

export function provideProgressRootContext(context: ProgressRootContext) {
	setContext(PROGRESS_ROOT_CONTEXT, context);
}

export function useProgressRootContext(): ProgressRootContext {
	const context = getContext<ProgressRootContext | undefined>(PROGRESS_ROOT_CONTEXT);
	if (context === undefined) {
		throw new Error(
			'Base UI: ProgressRootContext is missing. Progress parts must be placed within <Progress.Root>.'
		);
	}
	return context;
}
