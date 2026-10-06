export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'default',
    reference: url.searchParams.has('reference'),
  };
}
