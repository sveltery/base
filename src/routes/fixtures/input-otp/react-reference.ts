// React input-otp 1.4.2 counterpart of InputOTPFixture.svelte. Comparison only; never imported by src/lib.
// BaseOTPInput is upstream's apps/test/src/components/base-input.tsx without Tailwind.
import { createElement as h, Fragment, useEffect, useState, type ComponentProps } from 'react';
import { OTPInput, type RenderProps } from 'input-otp';
import type { InputOTPCase } from './cases.js';

import { mountApp, passProps } from '../react-fixture.js';

type OverrideProps = Partial<ComponentProps<typeof OTPInput>> & { 'data-testid'?: string };

function BaseOTPInput(overrideProps: OverrideProps) {
	const [value, setValue] = useState('');

	return h(
		OTPInput,
		passProps({
			value,
			onChange: setValue,
			containerClassName: 'group flex items-center',
			maxLength: 6,
			render: ({ slots, isFocused, isHovering }: RenderProps) =>
				h(
					'div',
					{
						className: 'flex items-center gap-1',
						'data-testid': 'input-otp-renderer',
						'data-test-render-is-hovering': isHovering ? 'true' : undefined,
						'data-test-render-is-focused': isFocused ? 'true' : undefined
					},
					slots.map((slot, index) =>
						h(
							'div',
							{
								key: index,
								'data-testid': `slot-${index}`,
								'data-test-char': slot.char ?? undefined,
								style: { width: 40, height: 56, border: '4px solid black' }
							},
							slot.char ?? ' '
						)
					)
				),
			...overrideProps
		})
	);
}

export function mountInputOTPReference(
	node: HTMLElement,
	scenario: InputOTPCase,
	onReady: () => void
) {
	function App() {
		const [disabled, setDisabled] = useState(false);
		useEffect(onReady, []);

		if (scenario === 'base') return h(BaseOTPInput, {});
		if (scenario === 'props') {
			return h(
				Fragment,
				null,
				h(BaseOTPInput, { 'data-testid': 'input-otp-1', disabled: true }),
				h(BaseOTPInput, { 'data-testid': 'input-otp-2', inputMode: 'numeric' }),
				h(BaseOTPInput, { 'data-testid': 'input-otp-3', inputMode: 'text' }),
				h(BaseOTPInput, { 'data-testid': 'input-otp-4', containerClassName: 'testclassname' }),
				h(BaseOTPInput, { 'data-testid': 'input-otp-5', maxLength: 3 }),
				h(BaseOTPInput, { 'data-testid': 'input-otp-6', id: 'testid', name: 'testname' }),
				h(BaseOTPInput, { 'data-testid': 'input-otp-7', pattern: ' ' })
			);
		}
		if (scenario === 'with-on-complete') {
			return h(BaseOTPInput, { onComplete: () => setDisabled(true), disabled });
		}
		return h(BaseOTPInput, { autoFocus: true });
	}

	return mountApp(node, App);
}
