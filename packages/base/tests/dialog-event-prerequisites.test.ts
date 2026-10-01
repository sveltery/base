// New Sveltery utility regression probes, NOT upstream Dialog test ports.
// Node Event probes use the none reason, whose public type accepts Event.
// These probes do not impersonate MouseEvent/KeyboardEvent or browser input.
// Event details derived from mui/base-ui v1.8.0; existing THIRD_PARTY_NOTICES.md applies.
import { describe, expect, it } from 'vitest';
import { createChangeEventDetails } from '../src/lib/index.js';
import { mergeProps, type PreventableEvent } from '../src/lib/merge-props/index.js';

describe('Dialog prerequisite: independent native prevention channels', () => {
  it('consumer preventDefault preserves internal composition and does not cancel change details', () => {
    const log: string[] = [];
    const event = new Event('click', { cancelable: true });
    const details = createChangeEventDetails('none', event);
    const props = mergeProps({ onclick: () => log.push('internal') }, { onclick: (native: Event) => { native.preventDefault(); log.push('consumer'); } });
    (props.onclick as (native: Event) => void)(event);
    expect(log).toEqual(['consumer', 'internal']);
    expect(event.defaultPrevented).toBe(true);
    expect(details.isCanceled).toBe(false);
    expect(details.isPropagationAllowed).toBe(false);
  });

  it('preventBaseUIHandler suppresses composition without native default or change cancellation', () => {
    const event = new Event('click', { cancelable: true });
    const details = createChangeEventDetails('none', event);
    let internalCalls = 0;
    const props = mergeProps({ onclick: () => { internalCalls += 1; } }, { onclick: (native: PreventableEvent) => native.preventBaseUIHandler() });
    (props.onclick as (native: Event) => void)(event);
    expect(internalCalls).toBe(0);
    expect((event as PreventableEvent).baseUIHandlerPrevented).toBe(true);
    expect(event.defaultPrevented).toBe(false);
    expect(details.isCanceled).toBe(false);
    expect(details.isPropagationAllowed).toBe(false);
  });

  it('cancel and allowPropagation preserve event identity and independent native flags', () => {
    const event = new Event('keydown', { cancelable: true });
    const details = createChangeEventDetails('none', event);
    details.cancel();
    expect(details.event).toBe(event);
    expect(details.reason).toBe('none');
    expect(details.isCanceled).toBe(true);
    expect(details.isPropagationAllowed).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(event.cancelBubble).toBe(false);
    details.allowPropagation();
    expect(details.isCanceled).toBe(true);
    expect(details.isPropagationAllowed).toBe(true);
    expect(event.defaultPrevented).toBe(false);
    expect(event.cancelBubble).toBe(false);
  });
});
