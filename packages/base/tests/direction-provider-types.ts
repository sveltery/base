// Framework-adapted type checks; zero ordinary credit. MIT: parity/direction-provider/UPSTREAM_LICENSE.
import type { ComponentProps, Snippet } from 'svelte';
import { DirectionProvider, useDirection, type DirectionProviderProps, type TextDirection } from '../src/lib/direction-provider/index.js';

declare const children: Snippet;
const props: DirectionProviderProps = { direction: 'rtl', children };
const componentProps: ComponentProps<typeof DirectionProvider> = { direction: 'ltr' };
const defaultProps: DirectionProviderProps = {};
const getter: ReturnType<typeof useDirection> = () => 'rtl';
const direction: TextDirection = getter();
// @ts-expect-error The pinned direction union excludes vertical.
const invalid: DirectionProviderProps = { direction: 'vertical' };
// @ts-expect-error Provider has no DOM host or dir attribute.
const host: DirectionProviderProps = { dir: 'rtl' };
// @ts-expect-error The Svelte hook returns a reactive getter, not a captured primitive.
const captured: TextDirection = getter;
// @ts-expect-error There is no direction override argument at the source pin.
const override = useDirection('rtl');
void [props, componentProps, defaultProps, direction, invalid, host, captured, override];
