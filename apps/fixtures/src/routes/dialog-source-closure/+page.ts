export function load({ url }: { url: URL }) { return { keep: url.searchParams.has('keep'), reference: url.searchParams.has('reference') }; }
