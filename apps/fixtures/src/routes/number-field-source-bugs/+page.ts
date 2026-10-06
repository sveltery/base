export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('scenario') ?? 'accept',
    reference: url.searchParams.get('reference') === 'react',
  };
}
