export function load({ url }: { url: URL }) { return { native: url.searchParams.has('native'), canceledReset: url.searchParams.has('canceled-reset') }; }
