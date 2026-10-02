import type { ClassValue } from 'svelte/elements';

function tokens(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(tokens);
  if (typeof value === 'object') {
    const classes: string[] = [];
    for (const key in value) if ((value as Record<string, unknown>)[key]) classes.push(key);
    return classes;
  }
  return [];
}

/** Resolve native Svelte ClassValues before string-only render prop composition. */
export function resolveClassValue(value: ClassValue): string | undefined {
  if (value == null) return undefined;
  return typeof value === 'object' ? tokens(value).join(' ') : String(value);
}
