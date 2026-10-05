// Adapted from useControlled.serializeToDevModeString and utils/empty,
// mui/base-ui v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
export const EMPTY_VALUE: never[] = Object.freeze([]) as never[];
export function serializeToDevModeString(input: unknown): string {
  let nextId = 0;
  const seen = new WeakMap<object, number>();
  try {
    const result = JSON.stringify(input, function replacer(key, value) {
      if (key === '_owner' && this != null && typeof this === 'object' && '$$typeof' in this)
        return undefined;
      if (typeof value === 'bigint') return `__bigint__:${value}`;
      if (value !== null && typeof value === 'object') {
        const id = seen.get(value);
        if (id !== undefined) return `__object__:${id}`;
        seen.set(value, nextId);
        nextId += 1;
      }
      return value;
    });
    return result ?? `__top__:${typeof input}`;
  } catch {
    return '__unserializable__';
  }
}
