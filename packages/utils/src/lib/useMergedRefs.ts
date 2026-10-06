// Mechanically ported from mui/base-ui v1.8.0 useMergedRefs.ts at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { useRefWithInit } from './useRefWithInit.js';
export type MergedRef<I> = { current: I | null } | ((instance: I | null) => void | (() => void));
export type MergedRefCallback<I> = (instance: I | null) => void;
type Empty = null | undefined;
type InputRef<I> = MergedRef<I> | Empty;
type Result<I> = MergedRefCallback<I> | null;
type Cleanup = () => void;

type ForkRef<I> = {
  callback: MergedRefCallback<I> | null;
  cleanup: Cleanup | null;
  refs: InputRef<I>[];
};

/** Native setup owner: one initialized source ref per component, shared by fixed/N calls. */
export function createMergedRefs<I>() {
  const storage = useRefWithInit(createForkRef<I>);
  /**
   * Merges refs into a single memoized callback ref or `null`.
   * This makes sure multiple refs are updated together and have the same value.
   *
   * This function accepts up to four refs. If you need to merge more, or have an unspecified number of refs to merge,
   * use `useMergedRefsN` instead.
   */
  function useMergedRefs(a: InputRef<I>, b: InputRef<I>): Result<I>;
  function useMergedRefs(a: InputRef<I>, b: InputRef<I>, c: InputRef<I>): Result<I>;
  function useMergedRefs(a: InputRef<I>, b: InputRef<I>, c: InputRef<I>, d: InputRef<I>): Result<I>;
  function useMergedRefs(
    a: InputRef<I>,
    b: InputRef<I>,
    c?: InputRef<I>,
    d?: InputRef<I>,
  ): Result<I> {
    const forkRef = storage.current;
    if (didChange(forkRef, a, b, c, d)) {
      update(forkRef, [a, b, c, d]);
    }
    return forkRef.callback;
  }

  /**
   * Merges an array of refs into a single memoized callback ref or `null`.
   *
   * If you need to merge a fixed number (up to four) of refs, use `useMergedRefs` instead for better performance.
   */
  function useMergedRefsN(refs: InputRef<I>[]): Result<I> {
    const forkRef = storage.current;
    if (didChangeN(forkRef, refs)) {
      update(forkRef, refs);
    }
    return forkRef.callback;
  }
  return { useMergedRefs, useMergedRefsN };
}

function createForkRef<I>(): ForkRef<I> {
  return {
    callback: null,
    cleanup: null as Cleanup | null,
    refs: [],
  };
}

function didChange<I>(
  forkRef: ForkRef<I>,
  a: InputRef<I>,
  b: InputRef<I>,
  c: InputRef<I>,
  d: InputRef<I>,
) {
  // prettier-ignore
  return (
    forkRef.refs[0] !== a ||
    forkRef.refs[1] !== b ||
    forkRef.refs[2] !== c ||
    forkRef.refs[3] !== d
  )
}

function didChangeN<I>(forkRef: ForkRef<I>, newRefs: InputRef<I>[]) {
  return (
    forkRef.refs.length !== newRefs.length ||
    forkRef.refs.some((ref, index) => ref !== newRefs[index])
  );
}

function update<I>(forkRef: ForkRef<I>, refs: InputRef<I>[]) {
  forkRef.refs = refs;

  if (refs.every((ref) => ref == null)) {
    forkRef.callback = null;
    return;
  }

  forkRef.callback = (instance: I | null) => {
    if (forkRef.cleanup) {
      forkRef.cleanup();
      forkRef.cleanup = null;
    }

    if (instance != null) {
      const cleanupCallbacks = Array(refs.length).fill(null) as Array<Cleanup | null>;

      for (let i = 0; i < refs.length; i += 1) {
        const ref = refs[i];
        if (ref == null) {
          continue;
        }
        switch (typeof ref) {
          case 'function': {
            const refCleanup = ref(instance);
            if (typeof refCleanup === 'function') {
              cleanupCallbacks[i] = refCleanup;
            }
            break;
          }
          case 'object': {
            ref.current = instance;
            break;
          }
          default:
        }
      }

      forkRef.cleanup = () => {
        for (let i = 0; i < refs.length; i += 1) {
          const ref = refs[i];
          if (ref == null) {
            continue;
          }
          switch (typeof ref) {
            case 'function': {
              const cleanupCallback = cleanupCallbacks[i];
              if (typeof cleanupCallback === 'function') {
                cleanupCallback();
              } else {
                // Legacy ref with no attach-time cleanup: detach by calling it with `null`.
                // It returns nothing; React 19 cleanups are handled in the branch above.
                void ref(null);
              }
              break;
            }
            case 'object': {
              ref.current = null;
              break;
            }
            default:
          }
        }
      };
    }
  };
}
