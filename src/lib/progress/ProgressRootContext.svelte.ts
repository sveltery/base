// State owner for Base UI v1.8.0 packages/react/src/progress/root/ProgressRootContext.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// React context plus `useRegisteredLabelId`'s functional clear is a class: parts read live
// derived progress fields, and label registration updates `labelId`.

import { getContext, setContext } from 'svelte';
import { computeProgress, type ProgressInputs } from './compute.js';

const PROGRESS_ROOT_CONTEXT = Symbol('progress-root');

export class ProgressRootContext {
	labelId = $state<string | undefined>(undefined);
	readonly computed = $derived.by(() => computeProgress(this.read()));

	constructor(private readonly read: () => ProgressInputs) {}

	get value() {
		return this.read().value;
	}

	setLabelId(next: string | undefined) {
		this.labelId = next;
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
