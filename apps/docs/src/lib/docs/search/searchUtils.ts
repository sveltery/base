// Base UI docs/src/components/Search/searchUtils.ts and SearchResultsList.tsx at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, copyright 2019 Material-UI SAS.
// Native KeyboardEvent replaces React's event.nativeEvent; result shape is the
// selected authored sitemap fields, not React/Autocomplete state ownership.
export interface SearchResult {
  title: string;
  path: string;
  slug: string;
  prefix?: string;
  type?: string;
}
export function normalizeSearchGroup(group: string) {
  return group.replace(/\s+Pages$/, '').replace(/^React\s+/, '');
}
export function searchResultToString(item: SearchResult | null) {
  return item ? item.title || item.slug : '';
}
export function handleModifiedEnterNavigation(
  event: KeyboardEvent,
  result: SearchResult | undefined,
  buildResultUrl: (result: SearchResult) => string,
) {
  if (event.isComposing || event.keyCode === 229) return false;
  if (
    event.key !== 'Enter' ||
    (!event.metaKey && !event.ctrlKey && !event.altKey)
  )
    return false;
  if (!result) return false;
  event.preventDefault();
  event.stopPropagation();
  window.open(buildResultUrl(result), '_blank', 'noopener,noreferrer');
  return true;
}
export function isUnmodifiedLeftClick(event: MouseEvent) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.shiftKey
  );
}
