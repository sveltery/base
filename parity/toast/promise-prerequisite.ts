// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ./UPSTREAM_LICENSE.
// Test-only prerequisite. No Toast package API, Svelte reactivity, or DOM behavior is implemented.
import type { ToastManagerUpdateOptions } from './types-prerequisite';

export function resolvePromiseOptions<T, Data extends object>(
  options:
    | string
    | ToastManagerUpdateOptions<Data>
    | ((result: T) => string | ToastManagerUpdateOptions<Data>),
  result?: T,
): ToastManagerUpdateOptions<Data> {
  if (typeof options === 'string') {
    return {
      description: options,
    };
  }

  if (typeof options === 'function') {
    const resolvedOptions = options(result as T);
    return typeof resolvedOptions === 'string' ? { description: resolvedOptions } : resolvedOptions;
  }

  return options;
}
