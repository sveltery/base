// Historical private fixture path; all consumers use the single source anchor orchestration.
export { useAnchorPositioning as createAnchorPositioning } from './useAnchorPositioning.svelte.js';
import type { useAnchorPositioning } from './useAnchorPositioning.svelte.js';
export type AnchorPositioningController = ReturnType<typeof useAnchorPositioning>;
