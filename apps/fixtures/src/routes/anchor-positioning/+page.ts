export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'default',
    reference: url.searchParams.has('reference'),
    ownerWindow: url.searchParams.has('owner-window'),
    shadow: url.searchParams.has('shadow'),
  };
}
