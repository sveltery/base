// Dialog utility prerequisites only; NO Dialog component parity is claimed.
// Derived from mui/base-ui v1.8.0, commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c,
// packages/react/src/merge-props/mergeProps.test.ts:6,30,55,256,283.
// MIT Copyright (c) 2019 Material-UI SAS. Full notice: ../../../parity/dialog/UPSTREAM_LICENSE.
// Adaptations: Vitest/native imports; lowercase native event props; native Event
// replaces React synthetic wrapper + MouseEvent. Observable upstream assertions retained.
import { describe, expect, it, vi } from 'vitest';
import { mergeProps, type PreventableEvent } from '../src/lib/merge-props/index.js';

import { mergeScenarios } from '../../../parity/dialog/merge-scenarios.js';

// This adapter assembles callbacks for the REAL mergeProps implementation.
// It contains no Dialog state machine, mounting code, focus or dismissal surrogate.
function nativeHandler(props: Record<string, unknown>, key: string): (event: Event) => unknown {
  const handler = props[key];
  if (typeof handler !== 'function') throw new Error(`Missing merged handler ${key}`);
  return handler as (event: Event) => unknown;
}

describe('Dialog prerequisite: upstream merge assertions through native adapter', () => {
  // Exact assertion list from upstream :6; event representation/prop keys adapted.
  it('merges event handlers [upstream :6]', () => {
    const theirProps = { onclick: vi.fn(), onkeydown: vi.fn() };
    const ourProps = { onclick: vi.fn(), onpaste: vi.fn() };
    const mergedProps = mergeProps(ourProps, theirProps);
    nativeHandler(mergedProps, 'onclick')(new Event('click'));
    nativeHandler(mergedProps, 'onkeydown')(new Event('keydown'));
    nativeHandler(mergedProps, 'onpaste')(new Event('paste'));
    expect(theirProps.onclick.mock.invocationCallOrder[0]).toBeLessThan(
      ourProps.onclick.mock.invocationCallOrder[0],
    );
    expect(theirProps.onclick.mock.calls.length).toBe(1);
    expect(ourProps.onclick.mock.calls.length).toBe(1);
    expect(theirProps.onkeydown.mock.calls.length).toBe(1);
    expect(ourProps.onpaste.mock.calls.length).toBe(1);
  });

  it.each(mergeScenarios)('$name [upstream :$line]', (scenario) => {
    const log: string[] = [];
    let ran = false;
    const inputs = scenario.handlersLeftToRight.map((action) => ({
      onclick:
        action === null
          ? undefined
          : (event: PreventableEvent) => {
              if (action.preventBaseUIHandler) event.preventBaseUIHandler();
              if (action.setsRan) ran = true;
              if (action.log !== undefined) log.push(action.log);
            },
    }));
    nativeHandler(mergeProps(...inputs), 'onclick')(new Event('click'));
    if (scenario.expectedLog !== undefined) expect(log).toEqual(scenario.expectedLog);
    if (scenario.expectedRan !== undefined) expect(ran).toBe(scenario.expectedRan);
  });
});
