// Derived from mui/base-ui v1.8.0 useRenderElement/getStateAttributesProps (MIT).
// Immutable source: 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; see THIRD_PARTY_NOTICES.md.
import { mergeProps } from '../merge-props/index.js';
import { untrack } from 'svelte';
import { resolveClassValue } from '../internals/resolveClassValue.js';
import type { ClassValue } from 'svelte/elements';
import type { UseRenderHostProps, UseRenderPropSources, UseRenderRef, UseRenderRefs, UseRenderStateAttributesMapping } from './types.js';

export const EMPTY_STATE = Object.freeze({}) as Record<string, never>;

export function stateAttributes<State extends Record<string, unknown>>(state: State, mapping?: UseRenderStateAttributesMapping<State>): UseRenderHostProps {
  const result: UseRenderHostProps = {};
  for (const key in state) {
    const value = state[key];
    if (mapping && Object.prototype.hasOwnProperty.call(mapping, key)) {
      const custom = mapping[key]!(value);
      if (custom != null) Object.assign(result, custom);
    } else if (value === true) result[`data-${key.toLowerCase()}`] = '';
    else if (value) result[`data-${key.toLowerCase()}`] = value.toString();
  }
  return result;
}

/** Keep the native CSS string cascade and enumerable attachment symbols through object merges. */
export function mergeHostProps(left: UseRenderHostProps, right: UseRenderHostProps): UseRenderHostProps {
  const resolved = { ...right };
  if ('class' in resolved) resolved.class = resolveClassValue(resolved.class as ClassValue);
  const result = mergeProps(left, resolved) as UseRenderHostProps;
  if (typeof resolved.style === 'string') result.style = [left.style, resolved.style].filter(value => value !== undefined && value !== '').join(';');
  for (const source of [left, resolved]) for (const key of Object.getOwnPropertySymbols(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, key)) result[key] = source[key];
  }
  return result;
}

export function resolveSources(sources?: UseRenderPropSources): UseRenderHostProps {
  let result: UseRenderHostProps = {};
  if (sources === undefined) return result;
  const inputs = Array.isArray(sources) ? sources : [sources];
  for (const source of inputs) {
    if (source === undefined) continue;
    // Like pinned mergeProps: getters replace the accumulated object and own handler chaining.
    result = typeof source === 'function' ? source(result) : mergeHostProps(result, source);
  }
  return result;
}

export function refList<Host extends Element>(...sources: (UseRenderRefs<Host> | null | undefined)[]): UseRenderRef<Host>[] {
  return sources.flatMap(source => source == null ? [] : Array.isArray(source) ? source.filter((ref): ref is UseRenderRef<Host> => ref != null) : [source as UseRenderRef<Host>]);
}

export function attachRefs<Host extends Element>(node: Host, refs: UseRenderRef<Host>[]): () => void {
  const cleanups = refs.map(ref => {
    if (typeof ref === 'function') {
      const cleanup = ref(node);
      return () => { if (typeof cleanup === 'function') cleanup(); else ref(null); };
    }
    ref.current = node;
    return () => { ref.current = null; };
  });
  return () => { for (const cleanup of cleanups) cleanup(); };
}

/** Like useMergedRefsN, preserve callback identity until the individual references change. */
export function memoRefAttachment<Host extends Element>(publish: (node: Host | null, previous?: Host) => void) {
  let previous: UseRenderRef<Host>[] | undefined;
  let attachment: ((node: Element) => () => void) | undefined;
  return (refs: UseRenderRef<Host>[]) => {
    if (!previous || refs.length !== previous.length || refs.some((ref, index) => ref !== previous![index])) {
      previous = refs;
      attachment = node => untrack(() => {
        const host = node as Host;
        publish(host);
        const cleanup = attachRefs(host, refs);
        return () => untrack(() => { cleanup(); publish(null, host); });
      });
    }
    return attachment!;
  };
}
