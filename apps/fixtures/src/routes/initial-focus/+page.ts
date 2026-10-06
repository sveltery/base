export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'ref',
    reference: url.searchParams.has('reference'),
  };
}
