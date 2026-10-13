// State owner for Base UI v1.9.0 packages/react/src/progress/root/ProgressRootContext.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// React context plus `useRegisteredLabelId`'s functional clear is a class: parts read live
// derived progress fields, and label registration updates `labelId`.

import { computeProgress, type ProgressInputs } from './compute.js';
import { defineContext } from '../internal/context.js';

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

export const [useProgressRootContext, provideProgressRootContext] =
	defineContext<ProgressRootContext>(
		'Base UI: ProgressRootContext is missing. Progress parts must be placed within <Progress.Root>.'
	);
