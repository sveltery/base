export function load({ url }: { url: URL }) {
  return {
    native: url.searchParams.has('native'),
    replacement: url.searchParams.has('replacement'),
    formReplacement: url.searchParams.has('formReplacement'),
    canceledReset: url.searchParams.has('canceledReset'),
    canceledSubmit: url.searchParams.has('canceledSubmit'),
  };
}
