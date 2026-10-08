// Upstream FloatingPortal starts `containerElement` and `portalNode` at null.
// `useIsoLayoutEffect` is a no-op when `document` is missing, so neither
// `createPortal` runs. Base UI v1.8.0 commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import PortalSsrHarness from '../../tests/PortalSsrHarness.svelte';

describe('portal SSR', () => {
	it('omits an open dialog and popover portal', () => {
		const body = render(PortalSsrHarness).body;

		expect(body).toContain('Open dialog');
		expect(body).toContain('Open popover');
		expect(body).not.toContain('DialogBody');
		expect(body).not.toContain('PopoverBody');
		expect(body).not.toContain('role="dialog"');
		expect(body).not.toContain('data-base-ui-portal');
	});
});
