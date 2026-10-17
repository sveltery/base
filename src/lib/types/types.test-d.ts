// Type tests, checked by `pnpm check`. Nothing here runs.
// `#lib` is the `@sveltery/base` entry and `./index.js` is the `@sveltery/base/types` entry.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { expectTypeOf } from 'vitest';
import type { RenderSnippet as RootRenderSnippet } from '#lib';
import type { RenderSnippet } from './index.js';

type State = { open: boolean };

expectTypeOf<RootRenderSnippet<HTMLDivElement, State>>().toEqualTypeOf<
	RenderSnippet<HTMLDivElement, State>
>();
expectTypeOf<RenderSnippet<HTMLDivElement, State>>().toEqualTypeOf<
	Snippet<[props: HTMLAttributes<HTMLDivElement>, state: State, children: Snippet | undefined]>
>();
