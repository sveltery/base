export function load({ url }: { url: URL }) {
  const value = url.searchParams.get('variant');
  const variant: 'dialog-parent' | 'alert-parent' | 'shadow' = value === 'alert-parent' || value === 'shadow' ? value : 'dialog-parent';
  return { variant, reference: url.searchParams.has('reference') };
}
