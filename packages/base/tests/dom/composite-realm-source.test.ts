// Paired actual pinned business helpers; supplementary realm coverage, zero ordinary credit.
// Base UI v1.8.0 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c, MIT: THIRD_PARTY_NOTICES.md.
import { expect, it } from 'vitest';
import {
  isElementVisible as originalVisible,
  isListIndexDisabled as originalDisabled,
} from '../../../../apps/fixtures/node_modules/@base-ui/react/floating-ui-react/utils/composite.js';
import { scrollIntoViewIfNeeded as originalScroll } from '../../../../apps/fixtures/node_modules/@base-ui/react/internals/composite/composite.js';
import {
  isElementVisible as nativeVisible,
  isListIndexDisabled as nativeDisabled,
} from '../../src/lib/internals/composite/utils/navigation.js';
import { scrollIntoViewIfNeeded as nativeScroll } from '../../src/lib/internals/composite/composite.js';

for (const [framework, visible, disabled, scroll] of [
  ['Original', originalVisible, originalDisabled, originalScroll],
  ['native', nativeVisible, nativeDisabled, nativeScroll],
] as const) {
  it(`${framework}: visibility and disabled-index guards support a connected null-defaultView element`, () => {
    const foreign = document.implementation.createHTMLDocument('composite realm');
    const button = foreign.createElement('button');
    foreign.body.append(button);
    expect(foreign.defaultView).toBeNull();
    expect(button.isConnected).toBe(true);
    expect(visible(button)).toBe(true);
    expect(disabled([button], 0)).toBe(false);
    button.style.display = 'none';
    expect(visible(button)).toBe(false);
    expect(disabled([button], 0)).toBe(true);
    button.style.display = 'contents';
    expect(visible(button)).toBe(false);
    button.style.display = 'inline-block';
    button.style.visibility = 'hidden';
    expect(visible(button)).toBe(false);
    button.style.visibility = 'visible';
    button.disabled = true;
    expect(disabled([button], 0)).toBe(true);
    button.remove();
    expect(visible(button)).toBe(false);
    expect(visible(null)).toBe(false);
  });

  it(`${framework}: supplied visibility styles retain precedence and checkVisibility stays authoritative`, () => {
    const foreign = document.implementation.createHTMLDocument('composite supplied styles');
    const button = foreign.createElement('button');
    foreign.body.append(button);
    button.style.display = 'none';
    const styles = window.getComputedStyle(document.createElement('button'));
    expect(visible(button, styles)).toBe(true);
    Object.defineProperty(button, 'checkVisibility', { value: () => false });
    expect(visible(button, styles)).toBe(false);
  });

  it(`${framework}: scroll margin/padding order works with the pin's global style lookup on a null-defaultView document`, () => {
    const foreign = document.implementation.createHTMLDocument('composite scroll realm');
    const container = foreign.createElement('div');
    const button = foreign.createElement('button');
    foreign.body.append(container);
    container.append(button);
    container.style.scrollPaddingRight = '5px';
    button.style.scrollMarginRight = '3px';
    Object.defineProperties(container, {
      clientWidth: { value: 60 },
      scrollWidth: { value: 200 },
      clientHeight: { value: 60 },
      scrollHeight: { value: 60 },
    });
    Object.defineProperties(button, {
      offsetLeft: { value: 80 },
      offsetWidth: { value: 20 },
      offsetParent: { value: container },
      scrollTo: { value: () => undefined },
    });
    const calls: ScrollToOptions[] = [];
    container.scrollTo = (options: ScrollToOptions | number) => {
      if (typeof options === 'object') calls.push(options);
    };
    expect(foreign.defaultView).toBeNull();
    scroll(container, button, 'ltr', 'horizontal');
    expect(calls).toEqual([{ left: 48, top: 0, behavior: 'auto' }]);
  });
}
