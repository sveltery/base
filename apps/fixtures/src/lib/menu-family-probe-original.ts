// Actual pinned Base UI 1.8.0 runtime for authored paired regressions; no library runtime dependency.
export * as React from 'react';
export { createRoot } from 'react-dom/client';
export { flushSync } from 'react-dom';
export { Menu } from '@base-ui/react/menu';
export { FloatingRootStore as OriginalStore } from '../../node_modules/@base-ui/react/floating-ui-react/components/FloatingRootStore.js';
export { PopupTriggerMap as OriginalMap } from '../../node_modules/@base-ui/react/utils/popups/popupTriggerMap.js';
export { HoverInteraction as OriginalHover, useHoverInteractionSharedState as originalHook } from '../../node_modules/@base-ui/react/floating-ui-react/hooks/useHoverInteractionSharedState.js';
export { useHoverReferenceInteraction as originalReferenceHook } from '../../node_modules/@base-ui/react/floating-ui-react/hooks/useHoverReferenceInteraction.js';
