/** Imperative IDs only. DOM label IDs must use Svelte's SSR-stable component IDs. */
export function createIdGenerator() {
  let counter = 0;
  const seed = Math.random().toString(36).slice(2);
  return () => `toast-${seed}-${++counter}`;
}
