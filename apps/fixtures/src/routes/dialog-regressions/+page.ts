export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'cancel',
    reference: url.searchParams.has('reference'),
  };
}
