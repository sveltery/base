// Assertions follow Base UI v1.9.0 packages/react/src/preview-card/{arrow,backdrop,popup,portal,trigger,viewport}/*.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `ref` and `className` function conformance (Svelte has `bind:this` and `class`),
// and the `.spec.tsx` type tests.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PreviewCardHarness from '../../tests/PreviewCardHarness.svelte';
import PreviewCardMissingHarness from '../../tests/PreviewCardMissingHarness.svelte';
import PreviewCardPartHarness from '../../tests/PreviewCardPartHarness.svelte';
import { byId, hover, settlePositioning } from '../../tests/previewCardEvents.js';

type Part = 'arrow' | 'backdrop' | 'popup' | 'portal' | 'positioner' | 'trigger' | 'viewport';

const PARTS: Part[] = ['arrow', 'backdrop', 'popup', 'portal', 'positioner', 'trigger', 'viewport'];

afterEach(settlePositioning);

function part() {
	return byId('part');
}

describe.each(PARTS)('PreviewCard.%s host element', (name) => {
	it('forwards class, attributes and attachments', async () => {
		render(PreviewCardPartHarness, { part: name });
		await expect.poll(part).not.toBeNull();

		const element = part()!;
		expect(element.classList.contains('probe')).toBe(true);
		expect(element.getAttribute('data-probe')).toBe('probe');
		expect(element.dataset.attached).toBe('yes');
	});

	it('applies a render snippet', async () => {
		render(PreviewCardPartHarness, { part: name, variant: 'render' });
		await expect.poll(part).not.toBeNull();

		const element = part()!;
		expect(element.tagName).toBe('DIV');
		expect(element.hasAttribute('data-replacement')).toBe(true);
		expect(element.classList.contains('probe')).toBe(true);
		expect(element.getAttribute('data-probe')).toBe('probe');
		expect(element.dataset.attached).toBe('yes');
	});
});

describe('PreviewCard.Trigger', () => {
	it('renders an anchor by default', async () => {
		render(PreviewCardPartHarness, { part: 'trigger' });
		await expect.poll(part).not.toBeNull();
		expect(part()).toBeInstanceOf(HTMLAnchorElement);
	});

	it('throws without PreviewCard.Root or a handle', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(PreviewCardMissingHarness, { case: 'trigger-without-root' })).toThrow(
			'Base UI: <PreviewCard.Trigger> must be either used within a <PreviewCard.Root> component or provided with a handle.'
		);
		vi.restoreAllMocks();
	});
});

describe('PreviewCard.Popup', () => {
	it('renders the children', async () => {
		render(PreviewCardHarness, { open: true });
		await expect.poll(() => byId('popup')?.textContent).toContain('Content');
	});

	it('throws a descriptive error when rendered outside <PreviewCard.Root>', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(PreviewCardMissingHarness, { case: 'popup-without-root' })).toThrow(
			'Base UI: PreviewCardRootContext is missing. PreviewCard parts must be placed within <PreviewCard.Root>.'
		);
		vi.restoreAllMocks();
	});

	it('throws a descriptive error when rendered outside <PreviewCard.Positioner>', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(PreviewCardMissingHarness, { case: 'popup-without-positioner' })).toThrow(
			'Base UI: PreviewCardPositionerContext is missing. PreviewCardPositioner parts must be placed within <PreviewCard.Positioner>.'
		);
		vi.restoreAllMocks();
	});
});

describe('PreviewCard.Positioner', () => {
	it('throws a descriptive error when rendered outside <PreviewCard.Portal>', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(PreviewCardMissingHarness, { case: 'positioner-without-portal' })).toThrow(
			'Base UI: <PreviewCard.Portal> is missing.'
		);
		vi.restoreAllMocks();
	});
});

describe('PreviewCard.Viewport', () => {
	it('throws a descriptive error when rendered outside <PreviewCard.Positioner>', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() =>
			render(PreviewCardMissingHarness, { case: 'viewport-without-positioner' })
		).toThrow(
			'Base UI: PreviewCardPositionerContext is missing. PreviewCardPositioner parts must be placed within <PreviewCard.Positioner>.'
		);
		vi.restoreAllMocks();
	});
});

describe('PreviewCard.Backdrop', () => {
	it('sets pointer-events none', async () => {
		render(PreviewCardHarness, { withBackdrop: true, delay: 0, closeDelay: 0 });
		hover(byId('trigger')!);

		await expect.poll(() => byId('backdrop')?.style.pointerEvents).toBe('none');
	});
});

describe('PreviewCard.Arrow', () => {
	it('is hidden from assistive technology and reports the placement', async () => {
		render(PreviewCardHarness, { open: true, withArrow: true });
		await expect.poll(() => byId('arrow')).not.toBeNull();

		const arrow = byId('arrow')!;
		expect(arrow.getAttribute('aria-hidden')).toBe('true');
		expect(arrow.getAttribute('data-side')).toBe(byId('positioner')!.getAttribute('data-side'));
		expect(arrow.getAttribute('data-align')).toBe(byId('positioner')!.getAttribute('data-align'));
	});
});
