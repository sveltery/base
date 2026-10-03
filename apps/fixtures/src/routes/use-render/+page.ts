export function load({ url }: { url: URL }) { return { scenario: url.searchParams.get('case') ?? 'public-default', reference: url.searchParams.has('reference') }; }
