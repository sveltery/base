// Adapted from Base UI v1.8.0 useButton/useFocusableWhenDisabled/dispatchClickWithModifiers.
// Pinned 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { mergeProps, type PreventableEvent } from '../merge-props/index.js';
type Props = Record<string | symbol, unknown>;
type KeyEvent = KeyboardEvent & PreventableEvent;
function dispatchClick(target: HTMLElement, event: KeyboardEvent) {
  const view = target.ownerDocument.defaultView!;
  const ClickEvent = view.PointerEvent ?? view.MouseEvent;
  target.dispatchEvent(new ClickEvent('click', { bubbles: true, cancelable: true, composed: true, detail: 0,
    shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey, metaKey: event.metaKey }));
}
/** Pure per-render prop resolver. No DOM state is copied into reactive state. */
export function getButtonProps(external: Props, disabled: boolean, focusableWhenDisabled: boolean, native: boolean): Props {
  const { onclick, onmousedown, onpointerdown, onkeydown, onkeyup, ...other } = mergeProps(external);
  const consumer = { onclick, onmousedown, onpointerdown, onkeydown, onkeyup } as {
    onclick?: (event: MouseEvent) => void; onmousedown?: (event: MouseEvent) => void;
    onpointerdown?: (event: PointerEvent) => void; onkeydown?: (event: KeyEvent) => void; onkeyup?: (event: KeyEvent) => void;
  };
  const focus: Props = { tabindex: 0 };
  if (!native && disabled) focus.tabindex = focusableWhenDisabled ? 0 : -1;
  if ((native && focusableWhenDisabled) || (!native && disabled)) focus['aria-disabled'] = disabled;
  if (native && !focusableWhenDisabled) focus.disabled = disabled;
  const resolved = mergeProps({
    'data-disabled': disabled ? '' : undefined,
    onclick(event: MouseEvent) { if (disabled) { event.preventDefault(); return; } consumer.onclick?.(event); },
    onmousedown(event: MouseEvent) { if (!disabled) consumer.onmousedown?.(event); },
    onpointerdown(event: PointerEvent) { if (disabled) { event.preventDefault(); return; } consumer.onpointerdown?.(event); },
    onkeydown(event: KeyEvent) {
      if (disabled) { if (focusableWhenDisabled && event.key !== 'Tab') event.preventDefault(); return; }
      consumer.onkeydown?.(event);
      if (event.baseUIHandlerPrevented || event.target !== event.currentTarget || native) return;
      const target = event.currentTarget as HTMLElement;
      const link = target.tagName === 'A' && Boolean((target as HTMLAnchorElement).href);
      // Links retain browser Enter activation. Space suppresses page scroll.
      if (link) { if (event.key === ' ') event.preventDefault(); return; }
      if (event.defaultPrevented || (event.key !== ' ' && event.key !== 'Enter')) return;
      event.preventDefault();
      if (event.key === 'Enter') { event.preventBaseUIHandler(); dispatchClick(target, event); }
    },
    onkeyup(event: KeyEvent) {
      if (disabled) return;
      consumer.onkeyup?.(event);
      if (event.baseUIHandlerPrevented || event.defaultPrevented || event.target !== event.currentTarget || native || event.key !== ' ') return;
      // Upstream deliberately keeps no cross-event state: keydown prevention alone
      // cannot cancel a later non-native Space keyup.
      event.preventBaseUIHandler(); dispatchClick(event.currentTarget as HTMLElement, event);
    },
  }, native ? { type: 'button' } : { role: 'button' }, focus, other);
  // mergeProps composes string keys; attachments remain enumerable symbol props.
  const symbols = Object.fromEntries(Object.getOwnPropertySymbols(external).filter(key => Object.prototype.propertyIsEnumerable.call(external, key)).map(key => [key, external[key]]));
  return { ...resolved, ...symbols };
}
