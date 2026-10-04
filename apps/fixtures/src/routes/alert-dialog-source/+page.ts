export function load({ url }: { url: URL }) {
  return { line: Number(url.searchParams.get('line') ?? 136), reference: url.searchParams.has('reference') };
}
