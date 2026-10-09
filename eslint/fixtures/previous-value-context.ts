import { getContext } from 'svelte';
import type { OTPFieldModel } from './previous-value-cross-model.js';

export function useWidget() {
	return getContext<OTPFieldModel>('widget');
}
