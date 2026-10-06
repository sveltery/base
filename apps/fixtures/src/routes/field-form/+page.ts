export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'native',
    reference: url.searchParams.has('reference'),
  };
}
