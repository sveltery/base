// Derived from Base UI v1.8.0 packages/react/src/utils/usePopupAutoResize.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The size variables go into the store and travel with the style attribute,
// so a later style update does not wipe them.

import { getAbortSignal } from 'svelte';
import { ScopedAnimationFrame } from '@sveltery/utils';
import { runOnceAnimationsFinish } from './animations-finished.js';
import { getCssDimensions } from './getCssDimensions.js';

export interface PopupAutoResizeStore {
	readonly mounted: boolean;
	readonly payload: unknown;
	readonly popupElement: HTMLElement | null;
	readonly positionerElement: HTMLElement | null;
	popupVars: Record<string, string>;
	positionerVars: Record<string, string>;
}

/** Animates the popup between the sizes of its old and new content. */
export class PopupAutoResize {
	private committedSize: { width: number; height: number } | null = null;
	private readonly frame = new ScopedAnimationFrame();

	constructor(
		private readonly store: PopupAutoResizeStore,
		readSide: () => string | null,
		readDirection: () => string
	) {
		$effect(() => {
			const content = store.payload;
			const mounted = store.mounted;
			const popup = store.popupElement;
			const positioner = store.positionerElement;
			const side = readSide();
			const textDirection = readDirection();
			if (!mounted || !popup || !positioner) {
				this.committedSize = null;
				store.positionerVars = {};
				store.popupVars = {};
				return;
			}
			this.beginResize(content, popup, side, textDirection, getAbortSignal());
			return () => this.frame.cancel();
		});
	}

	private beginResize(
		content: unknown,
		popup: HTMLElement,
		side: string | null,
		textDirection: string,
		signal: AbortSignal
	) {
		const store = this.store;
		const mark = content;
		const anchor = anchoring(side, textDirection);
		const previous = this.committedSize;
		store.popupVars = { ...anchor, '--popup-width': 'auto', '--popup-height': 'auto' };
		store.positionerVars = {
			'--positioner-width': 'max-content',
			'--positioner-height': 'max-content'
		};
		this.frame.request(() => {
			if (signal.aborted || !popup.isConnected || !Object.is(mark, store.payload)) return;
			const next = getCssDimensions(popup);
			this.committedSize = next;
			store.positionerVars = sizeVars('positioner', next);
			if (!previous) {
				store.popupVars = { ...anchor, ...sizeVars('popup', next) };
				return;
			}
			store.popupVars = { ...anchor, ...sizeVars('popup', previous) };
			this.frame.request(() => {
				if (signal.aborted) return;
				store.popupVars = { ...anchor, ...sizeVars('popup', next) };
				runOnceAnimationsFinish(
					popup,
					() => {
						if (signal.aborted) return;
						store.popupVars = { ...anchor, '--popup-width': 'auto', '--popup-height': 'auto' };
					},
					signal,
					false
				);
			});
		});
	}
}

function anchoring(side: string | null, textDirection: string) {
	const anchorTop = side === 'top';
	const anchorLeft =
		side === 'left' || side === (textDirection === 'rtl' ? 'inline-end' : 'inline-start');
	if (!anchorTop && !anchorLeft) return {};
	const vars: Record<string, string> = { position: 'absolute' };
	vars[anchorTop ? 'bottom' : 'top'] = '0';
	vars[anchorLeft ? 'right' : 'left'] = '0';
	return vars;
}

function sizeVars(kind: 'popup' | 'positioner', size: { width: number; height: number }) {
	const prefix = kind === 'popup' ? '--popup' : '--positioner';
	return {
		[`${prefix}-width`]: `${size.width}px`,
		[`${prefix}-height`]: `${size.height}px`
	};
}
