export function load({ url }: { url: URL }) {
  const reference = url.searchParams.get('reference') === 'react';
  const mode = url.searchParams.get('renderMode');
  const renderMode: 'csr' | 'hydrated' = mode === 'csr' ? 'csr' : mode === 'hydrated' ? 'hydrated' : reference ? 'csr' : 'hydrated';
  return { reference, scenario: url.searchParams.get('scenario') ?? 'default', renderMode };
}
