// Assertions follow Base UI v1.9.0 packages/utils/src/visuallyHidden.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VisuallyHiddenScrollerHarness from '../../tests/VisuallyHiddenScrollerHarness.svelte';

describe('visually hidden input', () => {
	it.each([
		['ltr', 'ltr'],
		['ltr', 'rtl'],
		['rtl', 'ltr'],
		['rtl', 'rtl']
	] as const)(
		'does not overflow a %s scroller with %s content',
		async (scrollerDir, contentDir) => {
			render(VisuallyHiddenScrollerHarness, { scrollerDir, contentDir });
			const scroller = page.getByTestId('scroller').element() as HTMLElement;
			await expect.element(page.getByRole('checkbox')).toBeInTheDocument();
			expect(scroller.querySelector('input')).not.toBeNull();

			expect(scroller.scrollWidth).toBe(scroller.clientWidth);
		}
	);
});
