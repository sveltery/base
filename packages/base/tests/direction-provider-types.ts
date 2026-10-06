// Framework-adapted type checks; zero ordinary credit. MIT: parity/direction-provider/UPSTREAM_LICENSE.
import type { ComponentProps, Snippet } from 'svelte';
import {
  DirectionProvider,
  useDirection,
  type DirectionProviderProps,
  type TextDirection,
} from '../src/lib/direction-provider/index.js';

declare const children: Snippet;
const props: DirectionProviderProps = { direction: 'rtl', children };
const componentProps: ComponentProps<typeof DirectionProvider> = { direction: 'ltr' };
const defaultProps: DirectionProviderProps = {};
const getter: ReturnType<typeof useDirection> = () => 'rtl';
const direction: TextDirection = getter();
const namespaceProps: DirectionProvider.Props = { direction: 'ltr', children };
const namespaceState: DirectionProvider.State = {};
const structuralState: DirectionProvider.State = { consumer: true };
// @ts-expect-error The pinned direction union excludes vertical.
const invalid: DirectionProviderProps = { direction: 'vertical' };
// @ts-expect-error Provider has no DOM host or dir attribute.
const host: DirectionProviderProps = { dir: 'rtl' };
// @ts-expect-error The Svelte hook returns a reactive getter, not a captured primitive.
const captured: TextDirection = getter;
// @ts-expect-error There is no direction override argument at the source pin.
const override = useDirection('rtl');
// @ts-expect-error The namespace's empty State type does not create a state component prop.
const stateProp: DirectionProvider.Props = { state: {} };
void [
  props,
  componentProps,
  defaultProps,
  direction,
  namespaceProps,
  namespaceState,
  structuralState,
  invalid,
  host,
  captured,
  override,
  stateProp,
];
