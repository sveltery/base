// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useFloating.ts
// `useBaseUIFloating` (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The store is the only writer of elements. This hook does not copy them back.

import type { VirtualElement } from '@floating-ui/dom';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import {
	usePosition,
	type UsePositionOptions,
	type UsePositionReturn
} from '../usePosition.svelte.js';

export function useBaseUIFloating(
	store: FloatingRootStore,
	options: () => Omit<UsePositionOptions, 'reference' | 'open'> & {
		anchor: Element | VirtualElement | null;
	}
): UsePositionReturn {
	return usePosition(() => {
		const current = options();
		return {
			...current,
			reference: current.anchor ?? store.referenceElement,
			open: store.isOpen()
		};
	});
}
