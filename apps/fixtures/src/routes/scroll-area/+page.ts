import type { ScrollAreaOptions } from '../../lib/scroll-area-harness.js';
export function load({ url }: { url: URL }) {
  return {
    reference: url.searchParams.get('reference') === 'react',
    options: JSON.parse(url.searchParams.get('options') ?? '{}') as Partial<ScrollAreaOptions>,
  };
}
