// Original Base UI 1.8.0 NavigationMenuRootContext/TreeContext, native context providers (MIT).
/* eslint-disable @typescript-eslint/no-explicit-any -- Original arbitrary Item value and generic Root defaults. */
import { getContext, setContext } from 'svelte';
import type { FloatingRootContext } from '../../floating-ui/types.js';
import type { TransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
import type { NavigationMenuRootChangeEventDetails } from '../types.js';
export type NavigationMenuPopupAutoSizeResetState = {
  abortController: AbortController | null;
  owner: any;
};
export interface NavigationMenuRootContext<Value = any> {
  readonly open: boolean;
  readonly value: Value | null;
  setValue(
    value: Value | null,
    details: NavigationMenuRootChangeEventDetails,
  ): void;
  readonly transitionStatus: TransitionStatus;
  readonly mounted: boolean;
  readonly popupElement: HTMLElement | null;
  setPopupElement(node: HTMLElement | null): void;
  readonly positionerElement: HTMLElement | null;
  setPositionerElement(node: HTMLElement | null): void;
  readonly popupSizeStyles: Record<string, string>;
  readonly positionerSizeStyles: Record<string, string>;
  syncSizeStyles(element: HTMLElement): void;
  readonly viewportElement: HTMLElement | null;
  setViewportElement(node: HTMLElement | null): void;
  readonly viewportTargetElement: HTMLElement | null;
  setViewportTargetElement(node: HTMLElement | null): void;
  readonly activationDirection: 'left' | 'right' | 'up' | 'down' | null;
  setActivationDirection(
    direction: NavigationMenuRootContext['activationDirection'],
  ): void;
  readonly floatingRootContext: FloatingRootContext | undefined;
  setFloatingRootContext(context: FloatingRootContext | undefined): void;
  currentContentRef: { current: HTMLDivElement | null };
  readonly nested: boolean;
  rootRef: { current: HTMLElement | null };
  beforeInsideRef: { current: HTMLSpanElement | null };
  afterInsideRef: { current: HTMLSpanElement | null };
  beforeOutsideRef: { current: HTMLSpanElement | null };
  afterOutsideRef: { current: HTMLSpanElement | null };
  prevTriggerElementRef: { current: Element | null | undefined };
  popupAutoSizeResetRef: { current: NavigationMenuPopupAutoSizeResetState };
  readonly delay: number;
  readonly closeDelay: number;
  readonly orientation: 'horizontal' | 'vertical';
  readonly viewportInert: boolean;
  setViewportInert(value: boolean): void;
}
const ROOT = Symbol('NavigationMenuRootContext');
const TREE = Symbol('NavigationMenuTreeContext');
export function provideNavigationMenuRootContext<Value>(
  context: NavigationMenuRootContext<Value>,
) {
  setContext(ROOT, context);
}
export function useNavigationMenuRootContext<Value = any>(
  optional?: false,
): NavigationMenuRootContext<Value>;
export function useNavigationMenuRootContext<Value = any>(
  optional: true,
): NavigationMenuRootContext<Value> | undefined;
export function useNavigationMenuRootContext<Value = any>(optional = false) {
  const context = getContext<NavigationMenuRootContext<Value> | undefined>(
    ROOT,
  );
  if (context === undefined && !optional)
    throw new Error(
      'Base UI: NavigationMenuRootContext is missing. Navigation Menu parts must be placed within <NavigationMenu.Root>.',
    );
  return context;
}
export function provideNavigationMenuTreeContext(id: string | undefined) {
  setContext(TREE, id);
}
export function useNavigationMenuTreeContext() {
  return getContext<string | undefined>(TREE);
}
