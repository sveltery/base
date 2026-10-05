// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Retained published untyped JavaScript; native render boundary is separately typed.
// @ts-nocheck
/**
 * Returns `true` when a HAST element carries the given class name.
 *
 * `className` is always the array shape (`['frame']`): it is what the
 * highlighter, `fallbackToHast` and any HAST that round-trips through
 * serialization produce, and what the compression dictionary encodes.
 */
export function hasClassName(element, name) {
  return element.properties?.className?.includes(name) ?? false;
}

/**
 * Returns `true` when a HAST element is a code frame span — its `className`
 * includes `'frame'` (see {@link hasClassName}).
 */
export function isFrameSpan(element) {
  return hasClassName(element, 'frame');
}
