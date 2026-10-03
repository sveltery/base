export function load({ url }: { url: URL }) {
  return {
    reference: url.searchParams.get("reference") === "react",
    scenario: url.searchParams.get("scenario") ?? "default",
  };
}
