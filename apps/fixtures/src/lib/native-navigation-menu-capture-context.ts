// Test-only actual Svelte context key; no Base runtime or logical event transport.
export const nativeCaptureContext = Symbol('BareNavigationMenuCaptureContext');
export type NativeCaptureOwner = { readonly value: string };
