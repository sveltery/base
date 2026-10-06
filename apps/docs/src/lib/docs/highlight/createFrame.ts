// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
import type { HastElement, HastElementContent, FrameType, FrameTruncated } from './types.js';
/**
 * Creates a HAST frame element (`span.frame`) with the given children and optional metadata.
 *
 * Used by both `addLineGutters` (initial frame creation) and `restructureFrames`
 * (splitting/rebuilding frames for highlighting or comment extraction).
 */
export function createFrame(
  children: HastElementContent[],
  frameType?: FrameType,
  indentLevel?: number,
  truncated?: FrameTruncated,
): HastElement {
  const properties: HastElement['properties'] = {
    className: ['frame'],
    dataLined: '',
  };
  if (frameType && frameType !== 'normal') {
    properties.dataFrameType = frameType;
  }

  // Set indent level on region frames (highlighted or focus, focused or unfocused)
  if (
    (frameType === 'highlighted' ||
      frameType === 'highlighted-unfocused' ||
      frameType === 'focus' ||
      frameType === 'focus-unfocused') &&
    indentLevel !== undefined
  ) {
    properties.dataFrameIndent = indentLevel;
  }
  if (truncated) {
    properties.dataFrameTruncated = truncated;
  }
  return {
    type: 'element',
    tagName: 'span',
    properties,
    children,
  };
}
