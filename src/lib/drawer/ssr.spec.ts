// Server rendering of Drawer. Base UI v1.9.0 renders no popup on the server and registers open
// drawers with the provider only after hydration
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import DrawerSsrHarness from '../../tests/DrawerSsrHarness.svelte';

/** The sorted attributes of the element with this test id. */
function openingTag(body: string, testId: string): string[] {
	const tag = body.match(new RegExp(`<div [^>]*data-testid="${testId}"[^>]*>`))?.[0] ?? '';
	return (tag.match(/[\w-]+="[^"]*"/g) ?? []).sort();
}

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
			expect(openingTag(body, 'swipe-area')).toEqual(
				expect.arrayContaining([
					'role="presentation"',
					'aria-hidden="true"',
					swipeAreaStyle,
					swipeAreaState,
					'data-swipe-direction="up"'
				])
			);
			expect(openingTag(body, 'swipe-area').join(' ')).toMatch(/id="base-ui-[^"]+"/);
			expect(openingTag(body, 'background')).toEqual(
				['data-inactive=""', 'data-testid="background"'].sort()
			);
			expect(openingTag(body, 'indent')).toEqual(
				['style="--drawer-swipe-progress: 0"', 'data-inactive=""', 'data-testid="indent"'].sort()
			);
		}
	);
});
