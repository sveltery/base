export function load({ url }: { url: URL }) {
  return {
    bare: url.searchParams.has('bare'),
    forwarded: url.searchParams.has('forwarded'),
    initiallyOpen: url.searchParams.has('initial'),
  };
}
