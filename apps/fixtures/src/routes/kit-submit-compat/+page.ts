export function load({ url }: { url: URL }) {
  return {
    mode: url.searchParams.get('mode') ?? 'default',
    instance: url.searchParams.get('instance') ?? 'sdk-submit',
    custom: url.searchParams.has('custom'),
    cancel: url.searchParams.has('cancel'),
    gated: url.searchParams.has('gated'),
    customReset: url.searchParams.has('customReset'),
  };
}
