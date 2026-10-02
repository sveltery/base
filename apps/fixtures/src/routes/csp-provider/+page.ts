export function load({ url }: { url: URL }) { return { reference: url.searchParams.has('reference') }; }
