export function load({ url }: { url: URL }) { return { scenario: url.searchParams.get('case') ?? 'custom', reference: url.searchParams.has('reference') }; }
