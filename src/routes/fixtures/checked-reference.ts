import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import type { CheckedCall } from './read-output.js';

type CheckedDetails = { reason: string; isCanceled: boolean; cancel: () => void };

export function useCheckedFixture(scenario: string, onReady: () => void) {
	const [owner, setOwner] = useState(false);
	const [calls, setCalls] = useState<CheckedCall[]>([]);
	const [values, setValues] = useState<(string | null)[]>([]);
	useEffect(onReady, []);
	const bound = scenario === 'bound';

	function changed(next: boolean, details: CheckedDetails) {
		if (scenario === 'cancel') details.cancel();
		const call = { checked: next, reason: details.reason, canceled: details.isCanceled };
		setCalls((previous) => [...previous, call]);
		if (bound && !details.isCanceled) setOwner(next);
	}

	function prevent(event: { preventBaseUIHandler?: () => void }) {
		if (scenario === 'prevented') event.preventBaseUIHandler?.();
	}

	function submitted(event: { preventDefault: () => void; currentTarget: EventTarget | null }) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const value = new FormData(form).get('notifications');
		setValues((previous) => [...previous, typeof value === 'string' ? value : null]);
	}

	function finish(control: ReactNode) {
		return h(
			Fragment,
			null,
			bound
				? h('input', {
						type: 'checkbox',
						'aria-label': 'Owner checked',
						checked: owner,
						onChange: () => setOwner(!owner)
					})
				: null,
			control,
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('output', { 'data-testid': 'values' }, JSON.stringify(values))
		);
	}

	return {
		owner,
		setOwner,
		bound,
		changed,
		prevent,
		submitted,
		shared: { onCheckedChange: changed, onClick: prevent },
		finish
	};
}
