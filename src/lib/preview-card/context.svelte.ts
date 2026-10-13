// Derived from Base UI v1.9.0 packages/react/src/preview-card/root/PreviewCardContext.ts,
// packages/react/src/preview-card/portal/PreviewCardPortalContext.ts, and
// packages/react/src/preview-card/positioner/PreviewCardPositionerContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { defineContext } from '../internal/context.js';
import type { AnchorPositioning } from '../internal/popups/index.js';
import type { PreviewCardStore } from './store.svelte.js';

export const [usePreviewCardRoot, setPreviewCardRoot, findPreviewCardRoot] =
	defineContext<PreviewCardStore>(
		'Base UI: PreviewCardRootContext is missing. PreviewCard parts must be placed within <PreviewCard.Root>.'
	);

export const [usePreviewCardPortal, setPreviewCardPortal] = defineContext<true>(
	'Base UI: <PreviewCard.Portal> is missing.'
);

export const [usePreviewCardPositioner, setPreviewCardPositioner] =
	defineContext<AnchorPositioning>(
		'Base UI: PreviewCardPositionerContext is missing. PreviewCardPositioner parts must be placed within <PreviewCard.Positioner>.'
	);
