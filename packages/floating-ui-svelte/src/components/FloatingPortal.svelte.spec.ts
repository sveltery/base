// Assertions follow Base UI v1.9.0 packages/react/src/floating-ui-react/components/FloatingFocusManager.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PortalFocusHarness from './__tests__/PortalFocusHarness.svelte';

function owner() {
	const portal = page.getByTestId('floating').element().closest('[data-base-ui-portal]');
	const span = document.querySelector('span[aria-owns]');
	return {
		portalId: portal?.id ?? '',
		owns: span?.getAttribute('aria-owns') ?? null,
		role: span?.getAttribute('role') ?? null
	};
}

describe('FloatingPortal', () => {
	it('owns a non-modal portal from a hidden span', async () => {
		const { component } = render(PortalFocusHarness);
		flushSync(() => component.show('mouse'));
		await expect.element(page.getByTestId('floating')).toBeInTheDocument();

		const { portalId, owns, role } = owner();
		expect(portalId).not.toBe('');
		expect(owns).toBe(portalId);
		expect(role).toBe(null);
		expect(page.getByTestId('reference').element().hasAttribute('aria-owns')).toBe(false);
	});

	it('sets the owner role when asked', async () => {
		const { component } = render(PortalFocusHarness, { portalOwnerRole: 'group' });
		flushSync(() => component.show('mouse'));
		await expect.element(page.getByTestId('floating')).toBeInTheDocument();

		expect(owner().role).toBe('group');
	});
});
