// Derived from Base UI v1.8.0 packages/react/src/progress/root/stateAttributesMapping.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { ProgressState } from './types.js';

/** Present when the progress has completed. */
const complete = 'data-complete';
/** Present when the progress is in indeterminate state. */
const indeterminate = 'data-indeterminate';
/** Present while the progress is progressing. */
const progressing = 'data-progressing';

export const progressStateAttributesMapping: StateAttributesMapping<ProgressState> = {
	status(value): Record<string, string> | null {
		if (value === 'progressing') {
			return { [progressing]: '' };
		}
		if (value === 'complete') {
			return { [complete]: '' };
		}
		if (value === 'indeterminate') {
			return { [indeterminate]: '' };
		}
		return null;
	}
};
