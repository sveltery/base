import { expect, it } from 'vitest';
import { getButtonProps } from '../src/lib/button/props.js';
// Supplemental ordinary-prop precedence regression. No source-declaration credit.
it('preserves explicit undefined/null type keys for native and render-snippet consumers', () => {
  expect(getButtonProps({}, false, false, true).type).toBe('button');
  expect(Object.hasOwn(getButtonProps({}, false, false, false), 'type')).toBe(false);
  for (const native of [false, true])
    for (const type of [undefined, null]) {
      const props = getButtonProps({ type }, false, false, native);
      expect(Object.hasOwn(props, 'type')).toBe(true);
      expect(props.type).toBe(type);
    }
});
