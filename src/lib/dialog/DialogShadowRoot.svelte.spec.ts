// Assertions follow Base UI v1.9.0 packages/react/src/dialog/root/DialogRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'svelte';
import DialogShadowRootHarness from '../../tests/DialogShadowRootHarness.svelte';

describe('closed shadow root', () => {
	let host: HTMLElement;
	let shadowRoot: ShadowRoot;
	let container: HTMLElement;
	let mounted: Record<string, unknown> | undefined;

	beforeEach(() => {
		host = document.body.appendChild(document.createElement('div'));
		shadowRoot = host.attachShadow({ mode: 'closed' });
		container = shadowRoot.appendChild(document.createElement('div'));
	});

	afterEach(async () => {
		if (mounted) await unmount(mounted);
		mounted = undefined;
		host.remove();
	});

	// Locators cannot reach into a closed shadow root, so the harness mounts directly.
	function render(props: ComponentProps<typeof DialogShadowRootHarness>) {
		mounted = mount(DialogShadowRootHarness, { target: container, props });
		flushSync();
	}

	function find(testId: string) {
		const selector = `[data-testid="${testId}"]`;
		return (
			shadowRoot.querySelector<HTMLElement>(selector) ??
			document.querySelector<HTMLElement>(selector)
		);
	}

	async function query(testId: string) {
		await expect.poll(() => find(testId)).not.toBeNull();
		return find(testId)!;
	}

	async function click(testId: string) {
		const element = await query(testId);
		element.click();
		flushSync();
		await Promise.resolve();
	}

	type PortalContainer = 'shadow root' | 'body' | undefined;

	function resolveContainer(target: PortalContainer) {
		if (target === 'shadow root') return shadowRoot;
		if (target === 'body') return document.body;
		return undefined;
	}

	// `undefined` is the portal's default: the parent portal's node, else the body.
	const portalSetups: { outer: PortalContainer; nested: PortalContainer }[] = [
		{ outer: 'shadow root', nested: undefined },
		{ outer: 'shadow root', nested: 'shadow root' },
		{ outer: 'shadow root', nested: 'body' },
		{ outer: undefined, nested: undefined },
		{ outer: undefined, nested: 'shadow root' }
	];

	describe.for(['modal dialog', 'non-modal dialog', 'alert dialog'] as const)(
		'nested %s',
		(nested) => {
			it.for(portalSetups)(
				'keeps the parent open on close (outer: $outer, nested: $nested)',
				async ({ outer, nested: nestedContainer }) => {
					const onOpenChange = vi.fn();
					render({
						nested,
						outerContainer: resolveContainer(outer),
						nestedContainer: resolveContainer(nestedContainer),
						onOpenChange
					});

					await click('open-nested');
					await query('nested');

					await click('close-nested');

					await expect.poll(() => find('nested')).toBeNull();
					expect(find('outer')).not.toBeNull();
					expect(onOpenChange).not.toHaveBeenCalled();
				}
			);
		}
	);

	it('still dismisses on a press outside the popup', async () => {
		const reasons: string[] = [];
		render({
			outerContainer: shadowRoot,
			onOpenChange: (_open, details) => reasons.push(details.reason)
		});

		await query('outer');
		await click('outside');

		await expect.poll(() => find('outer')).toBeNull();
		expect(reasons).toEqual(['outside-press']);
	});

	it('stays open on a press inside the popup', async () => {
		const onOpenChange = vi.fn();
		render({ outerContainer: shadowRoot, onOpenChange });

		await click('outer');

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(find('outer')).not.toBeNull();
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('stays open when a press starts inside the popup and ends outside', async () => {
		const onOpenChange = vi.fn();
		render({ outerContainer: shadowRoot, onOpenChange });
		const popup = await query('outer');
		const outside = await query('outside');
		const init = { bubbles: true, composed: true, button: 0 };

		popup.dispatchEvent(new PointerEvent('pointerdown', { ...init, pointerType: 'mouse' }));
		popup.dispatchEvent(new MouseEvent('mousedown', init));
		outside.dispatchEvent(new PointerEvent('pointerup', { ...init, pointerType: 'mouse' }));
		outside.dispatchEvent(new MouseEvent('mouseup', init));
		outside.dispatchEvent(new MouseEvent('click', { ...init, detail: 1 }));
		flushSync();

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(find('outer')).not.toBeNull();
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});
