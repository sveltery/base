// Derived from Base UI v1.9.0 packages/react/src/drawer/provider/DrawerProvider.tsx,
// provider/DrawerProviderContext.ts, viewport/DrawerViewportContext.tsx, and
// virtual-keyboard-provider/DrawerVirtualKeyboardContext.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { createContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';

/** Tracks which drawers under one Drawer.Provider are open, and the frontmost swipe visuals. */
export class DrawerProviderState {
	private readonly openDrawers = new SvelteSet<object>();
	swipeProgress = $state(0);
	frontmostHeight = $state(0);

	get active() {
		return this.openDrawers.size > 0;
	}

	setDrawerOpen(drawer: object, open: boolean) {
		if (open) this.openDrawers.add(drawer);
		else this.openDrawers.delete(drawer);
	}

	removeDrawer(drawer: object) {
		this.openDrawers.delete(drawer);
	}

	setVisualState(next: { swipeProgress?: number; frontmostHeight?: number }) {
		if (next.swipeProgress !== undefined) {
			this.swipeProgress = Number.isFinite(next.swipeProgress) ? next.swipeProgress : 0;
		}
		if (next.frontmostHeight !== undefined) {
			this.frontmostHeight = Number.isFinite(next.frontmostHeight) ? next.frontmostHeight : 0;
		}
	}
}

export const [getDrawerProvider, setDrawerProvider, hasDrawerProvider] =
	createContext<DrawerProviderState>();

export function findDrawerProvider() {
	return hasDrawerProvider() ? getDrawerProvider() : undefined;
}

export interface DrawerViewportContext {
	readonly swiping: boolean;
	getDragStyles(): Record<string, string | undefined>;
	readonly swipeStrength: number | null;
}

export const [getDrawerViewport, setDrawerViewport, hasDrawerViewport] =
	createContext<DrawerViewportContext>();

export function findDrawerViewport() {
	return hasDrawerViewport() ? getDrawerViewport() : undefined;
}

export interface DrawerVirtualKeyboardContext {
	onTouchStart(event: TouchEvent): void;
	/** The viewport's capture listener calls this, so it runs even when the swipe claims the move. */
	onTouchMove(event: TouchEvent): void;
	onTouchEnd(event: TouchEvent): void;
	onTouchCancel(): void;
}

export const [getDrawerVirtualKeyboard, setDrawerVirtualKeyboard, hasDrawerVirtualKeyboard] =
	createContext<DrawerVirtualKeyboardContext>();

export function findDrawerVirtualKeyboard() {
	return hasDrawerVirtualKeyboard() ? getDrawerVirtualKeyboard() : undefined;
}
