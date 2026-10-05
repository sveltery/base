export function load({ url }: { url: URL }) {
  const orientation = url.searchParams.get('orientation') === 'vertical' ? 'vertical' : 'horizontal';
  const direction = url.searchParams.get('direction') === 'rtl' ? 'rtl' : 'ltr';
  return { reference: url.searchParams.has('reference'), mode: url.searchParams.get('mode') ?? 'ordinary', defaultOpen: url.searchParams.has('open'), keepMounted: url.searchParams.has('keep'), cancel: url.searchParams.get('cancel') ?? '', orientation, direction } as const;
}
