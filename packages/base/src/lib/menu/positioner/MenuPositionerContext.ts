// Original MenuPositionerContext, native context with genuine positioned data (MIT).
import { getContext, setContext } from 'svelte';
import type { useAnchorPositioning } from '../../internals/anchor-positioning/useAnchorPositioning.svelte.js';
import type { PositionedFloatingContext } from '../../floating-ui/types.js';
export type MenuPositionerContext = Pick<
  ReturnType<typeof useAnchorPositioning>,
  'side' | 'align' | 'arrowRef' | 'arrowUncentered' | 'arrowStyles'
> & { readonly context: PositionedFloatingContext };
const POSITIONER = Symbol('MenuPositioner');
export function provideMenuPositionerContext(value: MenuPositionerContext) {
  setContext(POSITIONER, value);
}
export function useMenuPositionerContext(optional?: false): MenuPositionerContext;
export function useMenuPositionerContext(optional: true): MenuPositionerContext | undefined;
export function useMenuPositionerContext(optional?: boolean) {
  const context = getContext<MenuPositionerContext | undefined>(POSITIONER);
  if (context === undefined && !optional)
    throw new Error(
      'Base UI: MenuPositionerContext is missing. MenuPositioner parts must be placed within <Menu.Positioner>.',
    );
  return context;
}
