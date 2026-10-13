// Derived from Base UI v1.9.0 packages/react/src/tooltip/root/TooltipRootContext.ts,
// packages/react/src/tooltip/portal/TooltipPortalContext.ts,
// packages/react/src/tooltip/positioner/TooltipPositionerContext.ts, and
// packages/react/src/tooltip/provider/TooltipProviderContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { defineContext, defineOptionalContext } from '../internal/context.js';
import type { AnchorPositioning } from '../internal/popups/index.js';
import type { TooltipStore } from './store.svelte.js';

export const [useTooltipRoot, setTooltipRoot, findTooltipRoot] = defineContext<TooltipStore>(
	'Base UI: TooltipRootContext is missing. Tooltip parts must be placed within <Tooltip.Root>.'
);

export const [useTooltipPortal, setTooltipPortal] = defineContext<true>(
	'Base UI: <Tooltip.Portal> is missing.'
);

export const [useTooltipPositioner, setTooltipPositioner] = defineContext<AnchorPositioning>(
	'Base UI: TooltipPositionerContext is missing. TooltipPositioner parts must be placed within <Tooltip.Positioner>.'
);

/** The provider's `delay`. `closeDelay` travels through the delay group. */
export const [useTooltipProviderDelay, setTooltipProviderDelay] = defineOptionalContext<
	() => number | undefined
>(() => undefined);
