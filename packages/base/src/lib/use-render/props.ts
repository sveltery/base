// Derived from mui/base-ui v1.8.0 useRenderElement/getStateAttributesProps (MIT).
// Immutable source: 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; see THIRD_PARTY_NOTICES.md.
import { mergeProps } from '../merge-props/index.js';
import { untrack } from 'svelte';
import { resolveClassValue } from '../internals/resolveClassValue.js';
import type { ClassValue } from 'svelte/elements';
import type { UseRenderHostProps, UseRenderPropSources, UseRenderRef, UseRenderRefs, UseRenderStateAttributesMapping } from './types.js';

export const EMPTY_STATE = Object.freeze({}) as Record<string, never>;
// Like the pin, first getters receive this shared mutable input and empty arrays return it.
const EMPTY_PROPS: UseRenderHostProps = {};

export function stateAttributes<State extends Record<string, unknown>>(state: State, mapping?: UseRenderStateAttributesMapping<State>): UseRenderHostProps {
  const result: UseRenderHostProps = {};
  for (const key in state) {
    const value = state[key];
    // eslint-disable-next-line no-prototype-builtins -- Preserve the pinned mapping method boundary, including its failures.
    if (mapping?.hasOwnProperty(key)) {
      const custom = mapping[key]!(value);
      if (custom != null) Object.assign(result, custom);
    } else if (value === true) result[`data-${key.toLowerCase()}`] = '';
    else if (value) result[`data-${key.toLowerCase()}`] = value.toString();
  }
  return result;
}

/** Keep the native CSS string cascade and enumerable attachment symbols through object merges. */
export function mergeHostProps(left: UseRenderHostProps, right: UseRenderHostProps): UseRenderHostProps {
  const result = { ...left };
  mergeInto(result, right);
  return result;
}

function mergeInto(target: UseRenderHostProps, source: UseRenderHostProps | undefined) {
  if (!source) return;
  // Later source objects mutate the getter-owned accumulator and include inherited enumerable keys.
  // Merge only the incoming key; reinitializing the full accumulator would wrap raw getter handlers.
  for (const key in source) {
    const value = source[key];
    if (key === 'class') {
      target[key] = mergeProps(() => ({ class: target.class }), { class: resolveClassValue(value as ClassValue) }).class;
    } else if (key === 'style' && typeof value === 'string') {
      target.style = [target.style, value].filter(part => part !== undefined && part !== '').join(';');
    } else if (key === 'style' || (/^on[a-zA-Z]/u.test(key) && typeof value === 'function')) {
      target[key] = mergeProps(() => ({ [key]: target[key] }), { [key]: value })[key];
    } else if (/^on[a-zA-Z]/u.test(key) && value === undefined) {
      // The handler is preserved, but this assignment still observes writability and own keys.
      const previous = target[key];
      target[key] = previous;
    } else target[key] = value;
  }
  for (const key of Object.getOwnPropertySymbols(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, key)) target[key] = source[key];
  }
}

export function resolveSources(sources?: UseRenderPropSources): UseRenderHostProps {
  const inputs = Array.isArray(sources) ? sources : [sources];
  if (inputs.length === 0) return EMPTY_PROPS;
  const initial = inputs[0];
  // Slot zero initializes even when undefined/null/falsy. Copy own props before wrapping handlers.
  let result: UseRenderHostProps = typeof initial === 'function' ? { ...initial(EMPTY_PROPS) } : { ...initial };
  if (typeof initial !== 'function') {
    for (const key in result) {
      if (/^on[a-zA-Z]/u.test(key) && typeof result[key] === 'function') {
        result[key] = mergeProps({ [key]: result[key] })[key];
      }
    }
  }
  for (let index = 1; index < inputs.length; index += 1) {
    const source = inputs[index];
    if (typeof source === 'function') {
      // Later getters replace the actual accumulator; they own handlers, identity and writability.
      result = source(result);
    } else mergeInto(result, source);
  }
  return result;
}

type RefSlot<Host extends Element> = UseRenderRef<Host> | null | undefined;
export function refList<Host extends Element>(propsRef: RefSlot<Host>, ref: UseRenderRefs<Host> | undefined): RefSlot<Host>[] {
  // Preserve source positional/length semantics, including empty slots and fixed-vs-array ref shape.
  // The second slot is owned by the replacement element in React; native snippets own its attachment.
  return Array.isArray(ref) ? [propsRef, undefined, ...ref] : [propsRef, undefined, ref as RefSlot<Host>, undefined];
}

export function attachRefs<Host extends Element>(node: Host, refs: RefSlot<Host>[]): () => void {
  const cleanups = refs.map(ref => {
    if (ref == null) return () => {};
    if (typeof ref === 'function') {
      const cleanup = ref(node);
      return () => { if (typeof cleanup === 'function') cleanup(); else ref(null); };
    }
    if (typeof ref === 'object') {
      ref.current = node;
      return () => { ref.current = null; };
    }
    // The pinned ref switch ignores primitive values, including values produced by state mapping.
    return () => {};
  });
  return () => { for (const cleanup of cleanups) cleanup(); };
}

/** Like useMergedRefsN, preserve callback identity until the individual references change. */
export function memoRefAttachment<Host extends Element>(publish: (node: Host | null, previous?: Host) => void) {
  let previous: RefSlot<Host>[] | undefined;
  type Attachment = (node: Element) => () => void;
  let attachment: Attachment | undefined;
  let active: { attachment: Attachment; cleanup: () => void } | undefined;
  function resolve(refs: RefSlot<Host>[], arrayMode: boolean) {
    // The pinned fixed-ref comparison checks four positions; only its array form compares length.
    if (!previous || (arrayMode && refs.length !== previous.length) || refs.some((ref, index) => ref !== previous![index])) {
      previous = refs;
      const nextAttachment: Attachment = node => untrack(() => {
        // Like the pinned fork callback, attaching a new host first releases its previous host.
        active?.cleanup();
        const host = node as Host;
        publish(host);
        const releaseRefs = attachRefs(host, refs);
        let cleaned = false;
        const cleanup = () => untrack(() => {
          if (cleaned) return;
          cleaned = true;
          releaseRefs();
          publish(null, host);
          if (active?.cleanup === cleanup) active = undefined;
        });
        active = { attachment: nextAttachment, cleanup };
        return cleanup;
      });
      attachment = nextAttachment;
    }
    return attachment!;
  }
  return {
    resolve,
    beforeUpdate(nextAttachment: Attachment | undefined, replacingDefaultHost = false) {
      // React detaches a replaced ref before host mutation. Svelte attachments otherwise detach after it.
      if (active && (active.attachment !== nextAttachment || replacingDefaultHost)) active.cleanup();
    },
  };
}
