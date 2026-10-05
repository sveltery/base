export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'uncontrolled',
    part: url.searchParams.get('part') ?? 'Root',
    mode: url.searchParams.get('mode') ?? 'default',
  };
}
export const ssr = false;
