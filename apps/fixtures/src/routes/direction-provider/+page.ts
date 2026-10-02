export function load({ url }: { url: URL }) {
  return { scenario: url.searchParams.get('case') ?? 'configured', reference: url.searchParams.has('reference') };
}
