// Server rendering of AlertDialog. Base UI v1.9.0 renders no popup on the server
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import AlertDialogSsrHarness from '../../tests/AlertDialogSsrHarness.svelte';

describe('AlertDialog server render', () => {
	it.each([false, true])('renders the trigger and no popup when open is %s', (open) => {
		const { body } = render(AlertDialogSsrHarness, { props: { open } });

		expect(body).toContain('Open alert');
		expect(body).toContain('aria-haspopup="dialog"');
		expect(body).toContain('aria-expanded="false"');
		expect(body).not.toContain('aria-controls');
		expect(body).not.toContain('alertdialog');
		expect(body).not.toContain('AlertTitle');
	});
});
