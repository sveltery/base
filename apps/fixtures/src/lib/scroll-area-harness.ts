// Test-only equivalent authored fixtures for actual React19.2.8/Base UI1.8.0 and Svelte.
export interface ScrollAreaOptions {
  direction: 'ltr' | 'rtl';
  contentWidth: number;
  contentHeight: number;
  viewportSize: number;
  keepMounted: boolean;
  viewportMounted: boolean;
  scrollbarMounted: boolean;
  contentMounted: boolean;
  thumbMounted: boolean;
  cornerMounted: boolean;
  hidden: boolean;
  padding: number;
  margin: number;
  thumbMargin: number;
  trackHeight: number | null;
  trackThickness: number;
  threshold: number | { xStart?: number; xEnd?: number; yStart?: number; yEnd?: number };
  snap: string;
  nonce: string | undefined;
  disableStyleElements: boolean;
  ariaOverride: boolean;
  suppress: string;
  unmountOn: string;
  customRender: boolean;
  dropRef: boolean;
  repeated: boolean;
  snapItems: boolean;
  conformance: boolean;
  renderFunction: boolean;
}
export const defaultScrollAreaOptions: ScrollAreaOptions = {
  direction: 'ltr',
  contentWidth: 1000,
  contentHeight: 1000,
  viewportSize: 200,
  keepMounted: false,
  viewportMounted: true,
  scrollbarMounted: true,
  contentMounted: true,
  thumbMounted: true,
  cornerMounted: true,
  hidden: false,
  padding: 0,
  margin: 0,
  thumbMargin: 0,
  trackHeight: null,
  trackThickness: 10,
  threshold: 0,
  snap: '',
  nonce: undefined,
  disableStyleElements: false,
  ariaOverride: false,
  suppress: '',
  unmountOn: '',
  customRender: false,
  dropRef: false,
  repeated: false,
  snapItems: false,
  conformance: false,
  renderFunction: false,
};
export interface ScrollAreaHarness {
  configure: (patch: Partial<ScrollAreaOptions>) => void;
  destroy: () => void;
  refs: () => Record<string, boolean>;
}
declare global {
  interface Window {
    scrollAreaHarness?: ScrollAreaHarness;
  }
}
