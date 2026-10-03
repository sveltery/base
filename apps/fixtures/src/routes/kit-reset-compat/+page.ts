export function load({ url }: { url: URL }) {
  return {
    instance: url.searchParams.get('instance') ?? 'sdk-reset',
    cancel: url.searchParams.has('cancel'),
    custom: url.searchParams.has('custom'),
    gated: url.searchParams.has('gated'),
    issues: url.searchParams.has('issues'),
  };
}
