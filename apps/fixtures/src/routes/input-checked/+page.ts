export function load({ url }: { url: URL }) { return { scenario: url.searchParams.get('case') ?? 'checkbox-reject-off', reference: url.searchParams.has('reference') }; }
