export function load({ url }: { url: URL }) {
  return { native: url.searchParams.has('native'), replacement: url.searchParams.has('replacement'), canceledReset: url.searchParams.has('canceledReset'), canceledSubmit: url.searchParams.has('canceledSubmit') };
}
