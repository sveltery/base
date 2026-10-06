export const ssr = false;
export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'ordinary',
    reference: url.searchParams.has('reference'),
  };
}
