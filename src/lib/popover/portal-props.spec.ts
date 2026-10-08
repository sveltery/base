import type { Attachment } from 'svelte/attachments';
import type { Snippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import type { DialogPortalProps } from '../dialog/types.js';
import type { PopoverPortalProps, PopoverPortalState } from './types.js';

type RenderParams<SnippetType> = SnippetType extends Snippet<infer Params> ? Params : never;
type PortalRenderParams = RenderParams<NonNullable<PopoverPortalProps['render']>>;

const portalState: PortalRenderParams[1] = {};
const namedPortalState: PopoverPortalState = portalState;
const portalAttach: Attachment<HTMLDivElement> = () => {};
const portalProps: PortalRenderParams[0] = {
	[Symbol.for('sveltery-portal-type-probe')]: portalAttach
};

type AssertAssignable<Target, Source extends Target> = Source;
type PopoverPortalRender = NonNullable<PopoverPortalProps['render']>;
type DialogPortalRender = NonNullable<DialogPortalProps['render']>;

const portalRendersMatch: AssertAssignable<DialogPortalRender, PopoverPortalRender> | null = null;

describe('Popover portal render types', () => {
	it('accepts an empty portal state and a symbol attachment', () => {
		expect(namedPortalState).toEqual({});
		expect(typeof portalProps[Symbol.for('sveltery-portal-type-probe')]).toBe('function');
		expect(portalRendersMatch).toBeNull();
	});
});
