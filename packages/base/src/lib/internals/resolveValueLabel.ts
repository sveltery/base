// Source: Base UI v1.8.0 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-explicit-any -- Preserve the Source open item/value contracts and grouping predicates without rewriting business branches. */
import type { Snippet } from 'svelte';

/** Native Svelte labels retain authored Snippets rather than React element containers. */
export type ValueLabel = string | number | bigint | boolean | null | undefined | Snippet;
import { serializeValue } from './serializeValue.js';

type ItemRecord = Record<string, ValueLabel>;
type ItemsInput = ItemRecord | ReadonlyArray<LabeledItem> | ReadonlyArray<Group<any>> | undefined;

interface LabeledItem {
  value: any;
  label: ValueLabel;
}

export interface Group<Item = any> {
  [key: string]: unknown;
  items: ReadonlyArray<Item>;
}

function isGroup(item: any): item is Group<any> {
  return typeof item === 'object' && item != null && Array.isArray(item.items);
}

export function isGroupedItems(
  items: ReadonlyArray<any | Group<any>> | undefined,
): items is ReadonlyArray<Group<any>> {
  // A group must carry an actual `items` array: key presence alone would misclassify an item
  // with an unrelated or optional `items` field.
  return isGroup(items?.[0]);
}

export function flattenLeafItems<Item>(
  items: readonly Item[] | readonly Group<Item>[],
): readonly Item[] {
  return isGroupedItems(items)
    ? (items as readonly Group<Item>[]).flatMap((group) => group.items)
    : (items as readonly Item[]);
}

/**
 * Checks if the items array contains an item with a null value that has a non-null label.
 */
export function hasNullItemLabel(items: ItemsInput): boolean {
  if (!Array.isArray(items)) {
    return items != null && 'null' in items;
  }

  const arrayItems = items as ReadonlyArray<LabeledItem> | ReadonlyArray<Group<any>>;

  if (isGroupedItems(arrayItems)) {
    for (const group of arrayItems) {
      for (const item of group.items) {
        if (item && item.value == null && item.label != null) {
          return true;
        }
      }
    }
    return false;
  }

  for (const item of arrayItems) {
    if (item && item.value == null && item.label != null) {
      return true;
    }
  }

  return false;
}

export function stringifyAsLabel(item: any, itemToStringLabel?: (item: any) => string) {
  if (itemToStringLabel && item != null) {
    return itemToStringLabel(item) ?? '';
  }
  if (item && typeof item === 'object') {
    if ('label' in item && item.label != null) {
      return String(item.label);
    }
    if ('value' in item) {
      return String(item.value);
    }
  }
  return serializeValue(item);
}

export function stringifyAsValue(item: any, itemToStringValue?: (item: any) => string) {
  if (itemToStringValue && item != null) {
    return itemToStringValue(item) ?? '';
  }
  if (item && typeof item === 'object' && 'value' in item && 'label' in item) {
    return serializeValue(item.value);
  }
  return serializeValue(item);
}

export function resolveSelectedLabel(
  value: any,
  items: ItemsInput,
  itemToStringLabel?: (item: any) => string,
): ValueLabel {
  function fallback() {
    return stringifyAsLabel(value, itemToStringLabel);
  }

  if (itemToStringLabel && value != null) {
    return itemToStringLabel(value);
  }

  // Custom object with explicit label takes precedence
  if (value && typeof value === 'object' && 'label' in value && value.label != null) {
    return value.label;
  }

  // Items provided as plain record map
  if (items && !Array.isArray(items)) {
    const label = Object.hasOwn(items, value) ? (items as any)[value] : undefined;
    return label ?? fallback();
  }

  // Items provided as array (flat or grouped)
  if (Array.isArray(items)) {
    const arrayItems = items as ReadonlyArray<LabeledItem> | ReadonlyArray<Group<any>>;
    const flatItems = flattenLeafItems<LabeledItem>(arrayItems);

    if (value == null || typeof value !== 'object') {
      const match = flatItems.find((item) => item.value === value);
      if (match && match.label != null) {
        return match.label;
      }
      return fallback();
    }

    // Object without explicit label: try matching by its `value` property
    if ('value' in value) {
      const match = flatItems.find((item) => item && item.value === value.value);
      if (match && match.label != null) {
        return match.label;
      }
    }
  }

  return fallback();
}

export function resolveMultipleLabels(
  values: any[],
  items: ItemsInput,
  itemToStringLabel?: (item: any) => string,
): ValueLabel[] {
  return values.reduce<ValueLabel[]>((acc, value, index) => {
    if (index > 0) {
      acc.push(', ');
    }
    // Native consumers render these scalar/Snippet values in their source order.
    acc.push(resolveSelectedLabel(value, items, itemToStringLabel));
    return acc;
  }, []);
}
