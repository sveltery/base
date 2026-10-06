export function load({ url }: { url: URL }) {
  return {
    kind: url.searchParams.get('kind') ?? 'button',
    initial: url.searchParams.has('null') ? null : undefined,
    custom: url.searchParams.has('custom'),
  };
}
