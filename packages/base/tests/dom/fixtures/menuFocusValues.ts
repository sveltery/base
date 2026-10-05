export type FinalFocus = boolean | { current: HTMLElement | null } | ((type: string) => boolean | HTMLElement | null | void) | undefined;
export function focusValue(mode: string, generation: number, log: (value: string) => void, liveRef: { current: HTMLElement | null }): FinalFocus {
  const phase = generation === 0 ? 'old' : generation === 1 ? 'new' : 'latest';
  const element = () => document.getElementById(`${phase}-target`);
  if (mode === 'replace-ref') return { current: element() };
  if (mode === 'mutate-ref') return liveRef;
  if (mode === 'true-to-false') return generation === 0;
  if (mode === 'false-to-true') return generation !== 0;
  if (mode === 'undefined-to-callback' && generation === 0) return undefined;
  if (generation !== 0) {
    if (mode === 'callback-to-false') return false;
    if (mode === 'callback-to-undefined') return undefined;
    if (mode === 'callback-to-empty-ref') return { current: null };
    if (mode === 'callback-returns-false') return () => { log(phase); return false; };
    if (mode === 'callback-returns-undefined') return () => { log(phase); };
    if (mode === 'callback-returns-null') return () => { log(phase); return null; };
    if (mode === 'callback-returns-true') return () => { log(phase); return true; };
  }
  return () => { log(phase); return element(); };
}
