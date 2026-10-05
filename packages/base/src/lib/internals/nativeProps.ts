// Native prop representation boundary for the pinned shared renderer (MIT).
// CSS strings and ClassValue are Svelte APIs; source merge algorithms live in their original modules.
import type { ClassValue } from 'svelte/elements';
import { resolveClassValue } from './resolveClassValue.js';
import { mergeObjects } from '../utils/mergeObjects.js';
export type NativeStyle = string | Record<string, unknown>;

export function toNativeStyle(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return Object.entries(value as Record<string, unknown>)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${key.startsWith('--') ? key : key.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}:${value}`,
    )
    .join(';');
}

export function mergeNativeStyles(left: unknown, right: unknown): unknown {
  if (typeof left === 'string' || typeof right === 'string') {
    return [toNativeStyle(left), toNativeStyle(right)]
      .filter((value) => value !== undefined && value !== '')
      .join(';');
  }
  return mergeObjects(
    left as Record<string, unknown> | undefined,
    right as Record<string, unknown> | undefined,
  );
}

export function toNativeClass(value: unknown): string | undefined {
  return resolveClassValue(value as ClassValue);
}

/** Svelte attachment symbols are enumerable props, outside upstream string-keyed for-in loops. */
export function copyAttachmentSymbols(target: Record<string | symbol, unknown>, source: object) {
  for (const key of Object.getOwnPropertySymbols(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, key))
      target[key] = (source as Record<symbol, unknown>)[key];
  }
}
