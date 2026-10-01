// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
import { mergeProps } from '../merge-props/index.js';

/** The pinned native useButton defaults precede external scalar props;
 * its event handlers still guard the part-level disabled flag. */
export function nativeButtonProps(props: Record<string, unknown>, disabled: boolean): Record<string, unknown> {
  const result = mergeProps({ type: 'button', tabindex: 0, disabled }, props);
  for (const eventName of ['onclick', 'onmousedown', 'onkeydown', 'onkeyup', 'onpointerdown']) {
    const handler = result[eventName];
    if (typeof handler !== 'function') continue;
    result[eventName] = (event: Event) => {
      if (disabled) {
        if (eventName === 'onclick' || eventName === 'onpointerdown') event.preventDefault();
        return;
      }
      handler(event);
    };
  }
  return result;
}
