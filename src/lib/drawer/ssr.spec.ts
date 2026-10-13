// Server rendering of Drawer. Base UI v1.9.0 renders no popup on the server and registers open
// drawers with the provider only after hydration
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import DrawerSsrHarness from '../../tests/DrawerSsrHarness.svelte';

describe('Drawer server render', () => {
	it.each([
		[false, 'data-closed=""', 'style="touch-action: pan-x"'],
		[true, 'data-open=""', 'style="pointer-events: none; touch-action: pan-x"']
	])(
		'renders the trigger, swipe area and indent parts and no popup when open is %s',
		(open, swipeAreaState, swipeAreaStyle) => {
			const { body } = render(DrawerSsrHarness, { props: { open } });

			expect(body).toContain('Open drawer');
			expect(body).toContain('aria-haspopup="dialog"');
			expect(body).toContain('aria-expanded="false"');
			expect(body).not.toContain('aria-controls');
			expect(body).not.toContain('role="dialog"');
			expect(body).not.toContain('DrawerTitle');
			expect(body).toContain(
				`<div role="presentation" aria-hidden="true" ${swipeAreaStyle} id="base-ui-s3" ${swipeAreaState} data-swipe-direction="up" data-testid="swipe-area">`
			);
			expect(body).toContain('<div data-testid="background" data-inactive="">');
			expect(body).toContain(
				'<div style="--drawer-swipe-progress: 0" data-inactive="" data-testid="indent">'
			);
		}
	);
});
