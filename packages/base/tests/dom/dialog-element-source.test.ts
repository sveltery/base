// Shared Source predicate supplement; current Dialog interactions do not call this leaf.
// Execute the physical pinned React body, with zero ordinary assertion credit.
import { afterEach, expect, it } from 'vitest';
import { isTargetInsideEnabledTrigger as native } from '../../src/lib/floating-ui/utils/element.js';
import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
import { isTargetInsideEnabledTrigger as source } from '../../../../apps/fixtures/node_modules/@base-ui/react/floating-ui-react/utils/element.js';
import { PopupTriggerMap as SourceTriggerMap } from '../../../../apps/fixtures/node_modules/@base-ui/react/utils/popups/popupTriggerMap.js';

afterEach(() => document.body.replaceChildren());

for (const reference of [false, true])
  it(`${reference ? 'React reference' : 'Svelte'}: shared trigger classification retains the exact Tooltip marker for direct and descendant targets`, () => {
    const trigger = document.createElement('button');
    const child = document.createElement('span');
    trigger.append(child);
    document.body.append(trigger);
    const nativeMap = new PopupTriggerMap();
    nativeMap.add('owner', trigger);
    const sourceMap = new SourceTriggerMap();
    sourceMap.add('owner', trigger);
    const classify = reference
      ? (target: EventTarget | null) => source(target, sourceMap)
      : (target: EventTarget | null) => native(target, nativeMap);

    expect(classify(null)).toBe(false);
    expect(classify(document.createElement('span'))).toBe(false);
    for (const target of [trigger, child]) expect(classify(target)).toBe(true);
    for (const [attribute, expected] of [
      ['data-disabled', true],
      ['data-trigger-disabled', false],
    ] as const) {
      trigger.setAttribute(attribute, '');
      for (const target of [trigger, child]) expect(classify(target)).toBe(expected);
      trigger.removeAttribute(attribute);
    }
  });
