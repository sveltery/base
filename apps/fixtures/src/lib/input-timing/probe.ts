import { mount, tick, unmount } from 'svelte';
import Fixture from '../InputTimingFixture.svelte';
import { mountTimingReference } from './reference.js';
import type { TimingDecision, TimingFramework, TimingObservation, TimingResult } from './types.js';
/** Owns observers only while a single input dispatch runs; never patches native/framework APIs. */
export async function probeInputTiming(target: HTMLElement, framework: TimingFramework, decision: TimingDecision, preventBase = false): Promise<TimingResult> {
  const observations: TimingObservation[] = []; const cleanups: (() => void)[] = [];
  let input: HTMLInputElement | null = null; let form: HTMLFormElement | null = null;
  const record = (stage: string, requested?: string) => {
    if (!input || !form) return;
    observations.push({ stage, value: input.value, formData: new FormData(form).get('field') as string | null, ...(requested === undefined ? {} : { requested }) });
  };
  function observe(node: EventTarget, stage: string, capture = false) {
    const listener = (event: Event) => { if (event.target === input) record(stage); };
    node.addEventListener('input', listener, capture); cleanups.push(() => node.removeEventListener('input', listener, capture));
  }
  observe(target.ownerDocument, 'document:capture', true); observe(target, 'root:capture', true);
  observe(target, 'root:before-delegation'); observe(target.ownerDocument, 'document:before-registered-delegation');
  let remove: (() => void | Promise<void>) | undefined;
  try {
    if (framework === 'react') remove = mountTimingReference(target, decision, record, preventBase);
    else { const component = mount(Fixture, { target, props: { framework, decision, record, preventBase } }); remove = () => unmount(component); }
    await tick();
    input = target.querySelector<HTMLInputElement>('[data-testid=timing-input]')!; form = input.form!;
    observe(form, 'form:capture', true); observe(input, 'target:capture', true);
    observe(input, 'target:bubble'); observe(form, 'form:bubble');
    observe(target, 'root:after-delegation'); observe(target.ownerDocument, 'document:after-registered-delegation');
    const setter = Object.getOwnPropertyDescriptor(target.ownerDocument.defaultView!.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, 'edit');
    input.dispatchEvent(new target.ownerDocument.defaultView!.InputEvent('input', { bubbles: true, cancelable: true, composed: true }));
    record('dispatch:return'); const immediate = observations.slice();
    await tick(); await tick(); record('after:tick');
    return { framework, decision, immediate, settled: observations.slice(immediate.length), owner: target.querySelector('[data-testid=timing-owner]')!.textContent!, ...(preventBase ? { preventBase: true as const } : {}) };
  } finally { for (const cleanup of cleanups.reverse()) cleanup(); await remove?.(); }
}
