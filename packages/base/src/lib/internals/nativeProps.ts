// Native prop representation for pinned pure prop business (MIT).
// CSS strings and ClassValue are Svelte APIs; source merge algorithms live in their original modules.
import type { ClassValue, HTMLAttributes } from 'svelte/elements';
import { resolveClassValue } from './resolveClassValue.js';
import { mergeObjects } from '@sveltery/utils/mergeObjects';
// Public styles use Svelte's attribute representation; pure internal records still serialize below.
export type NativeStyle = HTMLAttributes<HTMLElement>['style'];

export function toNativeStyle(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (!value) return undefined;
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
