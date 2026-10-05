export function load({ url }: { url: URL }) {
  const selected = url.searchParams.get('family');
  const family = selected === 'preview-card' || selected === 'tooltip' ? selected : 'popover';
  const selectedAxis = url.searchParams.get('axis');
  const trackCursorAxis = selectedAxis === 'x' || selectedAxis === 'y' || selectedAxis === 'both' ? selectedAxis : 'none';
  const selectedModal = url.searchParams.get('modal');
  const modal = selectedModal === 'true' ? true : selectedModal === 'trap-focus' ? 'trap-focus' : false;
  return { family, reference: url.searchParams.has('reference'), mode: url.searchParams.get('mode') ?? 'ordinary', defaultOpen: url.searchParams.has('open'), keepMounted: url.searchParams.has('keep'), cancel: url.searchParams.get('cancel') ?? '', disabled: url.searchParams.has('disabled'), delay: Number(url.searchParams.get('delay') ?? 0), closeDelay: Number(url.searchParams.get('closeDelay') ?? 0), trackCursorAxis, modal } as const;
}
