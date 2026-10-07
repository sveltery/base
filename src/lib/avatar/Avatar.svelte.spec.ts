// Assertions follow Base UI v1.8.0 avatar root, image and fallback tests
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AvatarHarness from '../../tests/AvatarHarness.svelte';
import AvatarOrphan from '../../tests/AvatarOrphan.svelte';

const DATA_URI =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

type MockImage = {
	complete: boolean;
	naturalWidth: number;
	log: string[];
	sizes: string;
	src: string;
	srcset: string;
	onload: (() => void) | null;
	onerror: (() => void) | null;
};

function installImageMock({ completeOnSet = false, naturalWidth = 100 } = {}) {
	const Original = window.Image;
	const images: MockImage[] = [];

	class Mock {
		complete = false;
		naturalWidth = 0;
		log: string[] = [];
		#src = '';
		#srcset = '';
		#onload: (() => void) | null = null;
		#onerror: (() => void) | null = null;
		#referrerPolicy = '';
		#crossOrigin: string | null = null;
		#sizes = '';

		constructor() {
			images.push(this as unknown as MockImage);
		}

		get onload() {
			return this.#onload;
		}
		set onload(value: (() => void) | null) {
			this.log.push('onload');
			this.#onload = value;
		}
		get onerror() {
			return this.#onerror;
		}
		set onerror(value: (() => void) | null) {
			this.log.push('onerror');
			this.#onerror = value;
		}
		get referrerPolicy() {
			return this.#referrerPolicy;
		}
		set referrerPolicy(value: string) {
			this.log.push('referrerPolicy');
			this.#referrerPolicy = value;
		}
		get crossOrigin() {
			return this.#crossOrigin;
		}
		set crossOrigin(value: string | null) {
			this.log.push('crossOrigin');
			this.#crossOrigin = value;
		}
		get sizes() {
			return this.#sizes;
		}
		set sizes(value: string) {
			this.log.push('sizes');
			this.#sizes = value;
		}
		get srcset() {
			return this.#srcset;
		}
		set srcset(value: string) {
			this.log.push('srcset');
			this.#srcset = value;
			if (completeOnSet) {
				this.complete = true;
				this.naturalWidth = naturalWidth;
			}
		}
		get src() {
			return this.#src;
		}
		set src(value: string) {
			this.log.push('src');
			this.#src = value;
			if (completeOnSet) {
				this.complete = true;
				this.naturalWidth = naturalWidth;
			}
		}
	}

	window.Image = Mock as unknown as typeof window.Image;
	return {
		images,
		restore() {
			window.Image = Original;
		}
	};
}

describe('Avatar', () => {
	let mock = installImageMock({ completeOnSet: true });

	beforeEach(() => {
		mock.restore();
		mock = installImageMock({ completeOnSet: true });
	});

	afterEach(() => {
		mock.restore();
	});

	function statuses(handler: ReturnType<typeof vi.fn>) {
		return handler.mock.calls.map((call) => call[0]);
	}

	describe('root', () => {
		it('renders a span and does not copy loading status onto a data attribute', async () => {
			render(AvatarHarness, { src: 'avatar.png', alt: 'Jane Doe' });
			const root = page.getByTestId('root');

			await expect.element(page.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
			expect(root.element().tagName).toBe('SPAN');
			await expect.element(root).not.toHaveAttribute('data-imageloadingstatus');
		});

		it('render snippet receives props and state', async () => {
			render(AvatarHarness, { mode: 'root' });
			const root = page.getByTestId('root');

			await expect.element(root).toHaveAttribute('data-status', 'idle');
			await expect.element(root).toHaveClass('avatar-root');
			expect(root.element().tagName).toBe('DIV');
		});
	});

	describe('image loading status', () => {
		it('shows a cached image and hides the fallback', async () => {
			render(AvatarHarness, { src: 'https://example.com/cached-avatar.png', alt: 'Jane Doe' });

			await expect
				.element(page.getByRole('img', { name: 'Jane Doe' }))
				.toHaveAttribute('src', 'https://example.com/cached-avatar.png');
			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
		});

		it('passes image props to the rendered image and the probe, handlers first', async () => {
			render(AvatarHarness, {
				src: 'fallback.png',
				srcset: 'avatar.png 1x, avatar@2x.png 2x',
				sizes: '48px',
				crossorigin: 'anonymous',
				referrerpolicy: 'no-referrer'
			});

			const image = page.getByTestId('image');
			await expect.element(image).toHaveAttribute('crossorigin', 'anonymous');
			await expect.element(image).toHaveAttribute('referrerpolicy', 'no-referrer');
			await expect.element(image).toHaveAttribute('sizes', '48px');
			await expect.element(image).toHaveAttribute('srcset', 'avatar.png 1x, avatar@2x.png 2x');
			await expect.element(image).toHaveAttribute('src', 'fallback.png');
			await expect
				.poll(() => mock.images[0]?.log)
				.toEqual(['onload', 'onerror', 'referrerPolicy', 'crossOrigin', 'sizes', 'srcset', 'src']);
			expect(mock.images[0]?.sizes).toBe('48px');
			expect(mock.images[0]?.srcset).toBe('avatar.png 1x, avatar@2x.png 2x');
		});

		it('shows the image when only srcset is provided', async () => {
			render(AvatarHarness, { mode: 'srcset' });

			await expect.element(page.getByTestId('image')).toHaveAttribute('srcset', 'avatar.png 1x');
			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
		});

		it('reports loading then loaded', async () => {
			mock.restore();
			mock = installImageMock();
			const onLoadingStatusChange = vi.fn();
			render(AvatarHarness, { src: 'avatar.png', onLoadingStatusChange });

			await expect.poll(() => statuses(onLoadingStatusChange)).toEqual(['loading']);
			mock.images.at(-1)?.onload?.();
			await expect.poll(() => statuses(onLoadingStatusChange)).toEqual(['loading', 'loaded']);
			expect(statuses(onLoadingStatusChange)).not.toContain('idle');
		});

		it('reports loading then error', async () => {
			mock.restore();
			mock = installImageMock();
			const onLoadingStatusChange = vi.fn();
			render(AvatarHarness, { src: 'avatar.png', onLoadingStatusChange });

			await expect.poll(() => statuses(onLoadingStatusChange)).toEqual(['loading']);
			mock.images.at(-1)?.onerror?.();
			await expect.poll(() => statuses(onLoadingStatusChange)).toEqual(['loading', 'error']);
		});

		it('reports a cached error without idle', async () => {
			mock.restore();
			mock = installImageMock({ completeOnSet: true, naturalWidth: 0 });
			const onLoadingStatusChange = vi.fn();
			render(AvatarHarness, { src: 'avatar.png', onLoadingStatusChange });

			await expect.poll(() => statuses(onLoadingStatusChange)).toContain('error');
			expect(statuses(onLoadingStatusChange)).not.toContain('idle');
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
			await expect.element(page.getByTestId('image')).not.toBeInTheDocument();
		});
	});

	describe('prop: keepMounted', () => {
		it('mounts the image without a detached probe', async () => {
			render(AvatarHarness, { mode: 'keep', src: 'avatar.png' });

			await expect.element(page.getByTestId('image')).toHaveAttribute('src', 'avatar.png');
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
			expect(mock.images).toHaveLength(0);
		});

		it('resolves a cached image from the rendered element', async () => {
			const onLoadingStatusChange = vi.fn();
			render(AvatarHarness, { mode: 'keep', src: DATA_URI, onLoadingStatusChange });

			await expect.element(page.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
			await expect.element(page.getByTestId('image')).not.toHaveAttribute('aria-hidden');
			await expect.poll(() => statuses(onLoadingStatusChange)).toContain('loaded');
			expect(statuses(onLoadingStatusChange)).not.toContain('idle');
			expect(mock.images).toHaveLength(0);
		});

		it('keeps a failed image mounted and hidden from assistive technology', async () => {
			const onLoadingStatusChange = vi.fn();
			const onerror = vi.fn();
			render(AvatarHarness, {
				mode: 'keep',
				src: '/missing-avatar.png',
				onLoadingStatusChange,
				onerror
			});

			await expect.element(page.getByTestId('image')).toHaveAttribute('data-error', '');
			await expect.element(page.getByTestId('image')).toHaveAttribute('aria-hidden', 'true');
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
			await expect.poll(() => statuses(onLoadingStatusChange)).toContain('error');
			expect(onerror).toHaveBeenCalled();
		});

		it('marks the loading state until the image loads', async () => {
			const onload = vi.fn();
			render(AvatarHarness, { mode: 'keep', src: '/slow-avatar.png', onload });
			const image = page.getByTestId('image');

			await expect.element(image).toHaveAttribute('data-loading', '');
			await expect.element(image).toHaveAttribute('aria-hidden', 'true');
			image.element().dispatchEvent(new Event('load'));
			expect(onload).toHaveBeenCalled();
			await expect.element(image).not.toHaveAttribute('data-loading');
			await expect.element(image).not.toHaveAttribute('aria-hidden');
			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
		});

		it('preserves an explicit aria-hidden value', async () => {
			render(AvatarHarness, { mode: 'keep', src: DATA_URI, ariaHidden: false });
			const image = page.getByTestId('image');

			await expect.element(image).toHaveAttribute('aria-hidden', 'false');
			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
			await expect.element(image).toHaveAttribute('aria-hidden', 'false');
		});

		it('resolves a source-less image to error without loading', async () => {
			const onLoadingStatusChange = vi.fn();
			render(AvatarHarness, { mode: 'keep', onLoadingStatusChange });

			await expect.poll(() => statuses(onLoadingStatusChange)).toEqual(['error']);
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
		});

		it('resets when the src prop changes', async () => {
			const onLoadingStatusChange = vi.fn();
			render(AvatarHarness, {
				mode: 'keep',
				src: DATA_URI,
				controls: true,
				onLoadingStatusChange
			});

			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
			onLoadingStatusChange.mockClear();
			await page.getByRole('button', { name: 'Swap source' }).click();

			await expect.poll(() => statuses(onLoadingStatusChange)).toEqual(['loading', 'error']);
			await expect.element(page.getByTestId('image')).toHaveAttribute('data-error', '');
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
		});

		it('places src after the props that configure the request', async () => {
			const box = { keys: [] as string[] };
			render(AvatarHarness, {
				mode: 'keys',
				box,
				src: 'avatar.png',
				srcset: 'avatar.png 1x, avatar@2x.png 2x',
				sizes: '48px',
				loading: 'lazy'
			});

			await expect.poll(() => box.keys.indexOf('src')).toBeGreaterThan(box.keys.indexOf('loading'));
			await expect.poll(() => box.keys.indexOf('src')).toBeGreaterThan(box.keys.indexOf('sizes'));
			await expect.poll(() => box.keys.indexOf('src')).toBeGreaterThan(box.keys.indexOf('srcset'));
		});
	});

	describe('fallback', () => {
		it('shows immediately when delay is 0 and there is no image', async () => {
			render(AvatarHarness, { mode: 'delay', delay: 0 });

			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
			expect(page.getByTestId('fallback').element().tagName).toBe('SPAN');
		});

		it('waits for a positive delay', async () => {
			render(AvatarHarness, { mode: 'delay', delay: 250 });
			const fallback = page.getByTestId('fallback');

			await expect.element(fallback).not.toBeInTheDocument();
			await expect.element(fallback).toBeInTheDocument();
		});

		it('shows when delay changes to 0', async () => {
			render(AvatarHarness, { mode: 'delay', delay: 800, controls: true });

			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
			await page.getByRole('button', { name: 'Set delay 0' }).click();
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
		});

		it('stays visible when delay changes from 0 to a number', async () => {
			render(AvatarHarness, { mode: 'delay', delay: 0, controls: true });

			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
			await page.getByRole('button', { name: 'Set delay 800' }).click();
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
		});

		it('returns when the loaded image is removed', async () => {
			render(AvatarHarness, { mode: 'unmount', src: 'avatar.png' });

			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
			await expect.element(page.getByTestId('image')).toBeInTheDocument();
			await page.getByRole('button', { name: 'Hide image' }).click();
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
			await expect.element(page.getByTestId('image')).not.toBeInTheDocument();
		});

		it('resets the root when one of two images is removed', async () => {
			// Preserves upstream AvatarImage cleanup: unmount sets the root to idle
			// even when another image is still loaded, so the fallback comes back.
			render(AvatarHarness, { mode: 'two', src: 'avatar.png' });

			await expect.element(page.getByTestId('fallback')).not.toBeInTheDocument();
			await page.getByRole('button', { name: 'Drop first' }).click();
			await expect.element(page.getByTestId('one')).not.toBeInTheDocument();
			await expect.element(page.getByTestId('two')).toBeInTheDocument();
			await expect.element(page.getByTestId('fallback')).toBeInTheDocument();
		});
	});

	describe('native Svelte', () => {
		it('passes consumer attachments to the image', async () => {
			render(AvatarHarness, { mode: 'attach', src: DATA_URI });

			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippet receives props, state and consumer attachments', async () => {
			render(AvatarHarness, { mode: 'attach', src: DATA_URI, custom: true });

			await expect.element(page.getByTestId('host')).toHaveTextContent('custom-host');
			await expect.element(page.getByTestId('image')).toHaveAttribute('data-status', 'loaded');
		});

		it('requires a root', () => {
			expect(() => render(AvatarOrphan)).toThrow(/AvatarRootContext is missing/);
		});
	});
});
