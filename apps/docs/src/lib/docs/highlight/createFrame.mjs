// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Retained published untyped JavaScript; native render boundary is separately typed.
// @ts-nocheck
/**
 * Creates a HAST frame element (`span.frame`) with the given children and optional metadata.
 *
 * Used by both `addLineGutters` (initial frame creation) and `restructureFrames`
 * (splitting/rebuilding frames for highlighting or comment extraction).
 */
export function createFrame(children, frameType, indentLevel, truncated) {
  const properties = {
    className: ['frame'],
    dataLined: ''
  };
  if (frameType && frameType !== 'normal') {
    properties.dataFrameType = frameType;
  }

  // Set indent level on region frames (highlighted or focus, focused or unfocused)
  if ((frameType === 'highlighted' || frameType === 'highlighted-unfocused' || frameType === 'focus' || frameType === 'focus-unfocused') && indentLevel !== undefined) {
    properties.dataFrameIndent = indentLevel;
  }
  if (truncated) {
    properties.dataFrameTruncated = truncated;
  }
  return {
    type: 'element',
    tagName: 'span',
    properties,
    children
  };
}
