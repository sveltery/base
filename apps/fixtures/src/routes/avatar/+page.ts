export const ssr = false;
export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'pending',
    reference: url.searchParams.has('reference'),
    part: url.searchParams.get('part') ?? 'Root',
    mode: url.searchParams.get('mode') ?? 'default',
  };
}
