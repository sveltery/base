// Behavior reference: mui/base-ui v1.8.0 mergeProps.ts. MIT; see THIRD_PARTY_NOTICES.md.
export type PreventableEvent = Event & {
  preventBaseUIHandler(): void;
  baseUIHandlerPrevented?: boolean;
};
type Props = Record<string, unknown>;
type Input = Props | ((previous: Props) => Props) | undefined;
type Handler = (...args: unknown[]) => unknown;
function isHandler(key: string, value: unknown): value is Handler {
  return /^on[a-zA-Z]/u.test(key) && (typeof value === 'function');
}
function isNativeEvent(value: unknown): value is Event {
  if (value === null || typeof value !== 'object' || typeof Event === 'undefined') return false;
  // The native getter checks the Event brand across windows without trusting payload fields.
  // Calling the getter directly also avoids invoking a custom object's own `type` getter.
  try {
    const getType = Object.getOwnPropertyDescriptor(Event.prototype, 'type')?.get;
    return typeof getType?.call(value) === 'string';
  } catch {
    return false;
  }
}
function wrap(handler: Handler, previous?: Handler): Handler {
  return (...args) => {
    const event = args[0];
    if (isNativeEvent(event)) {
      const preventable = event as PreventableEvent;
      preventable.preventBaseUIHandler = () => { preventable.baseUIHandlerPrevented = true; };
      const result = handler(...args);
      if (!preventable.baseUIHandlerPrevented) previous?.(...args);
      return result;
    }
    const result = handler(...args);
    previous?.(...args);
    return result;
  };
}
export function mergeProps(...inputs: Input[]): Props {
  let merged: Props = {};
  let initialized = false;
  for (const input of inputs) {
    if (input === undefined) continue;
    if (!initialized) {
      initialized = true;
      merged = { ...(typeof input === 'function' ? input({}) : input) };
      if (typeof input !== 'function') {
        for (const [key, value] of Object.entries(merged)) {
          if (isHandler(key, value)) merged[key] = wrap(value);
        }
      }
      continue;
    }
    if (typeof input === 'function') {
      merged = input(merged);
      continue;
    }
    for (const [key, value] of Object.entries(input ?? {})) {
      if (key === 'class' || key === 'className') {
        merged[key] = value ? (merged[key] ? `${value} ${merged[key]}` : value) : merged[key];
      } else if (key === 'style' && (typeof value === 'object' || value === undefined)) {
        if (!merged[key] && value) merged[key] = value;
        else if (merged[key] && value) merged[key] = { ...(typeof merged[key] === 'object' ? merged[key] : {}), ...value };
        else merged[key] = merged[key];
      } else if (isHandler(key, value)) {
        const previous = merged[key];
        merged[key] = wrap(value, typeof previous === 'function' ? previous as Handler : undefined);
      } else if (/^on[a-zA-Z]/u.test(key) && value === undefined) {
        // An undefined handler does not erase an existing handler.
      } else {
        merged[key] = value;
      }
    }
  }
  return merged;
}
export function mergePropsN(inputs: Input[]): Props {
  return mergeProps(...inputs);
}
