export function load({ url }: { url: URL }) { return { scenario: url.searchParams.get('case') ?? 'undefined', reference: url.searchParams.has('reference') }; }
