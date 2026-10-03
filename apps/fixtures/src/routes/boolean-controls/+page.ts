export function load({ url }: { url: URL }) {
  return {
    family:
      url.searchParams.get('family') === 'checkbox'
        ? ('checkbox' as const)
        : ('switch' as const),
    scenario: url.searchParams.get('case') ?? 'default',
    reference: url.searchParams.has('reference'),
  };
}
