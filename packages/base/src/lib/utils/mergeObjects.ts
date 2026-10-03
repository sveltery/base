// Ported from mui/base-ui v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
export function mergeObjects<A extends object | undefined, B extends object | undefined>(
  a: A,
  b: B,
) {
  if (a && !b) {
    return a;
  }
  if (!a && b) {
    return b;
  }
  if (a || b) {
    return { ...a, ...b };
  }
  return undefined;
}
