// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ./UPSTREAM_LICENSE.
// Test-only prerequisite. No Toast package API, Svelte reactivity, or DOM behavior is implemented.
let counter = 0;
export function generateId(prefix: string) {
  counter += 1;
  return `${prefix}-${Math.random().toString(36).slice(2, 6)}-${counter}`;
}
