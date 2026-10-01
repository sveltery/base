/** Native click composition is retained for custom elements activated by the keyboard. */
export function buttonKeys(disabled: () => boolean, native: () => boolean) {
  const dispatch = (event: KeyboardEvent) => {
    const node = event.currentTarget as HTMLElement;
    const MouseEvent = node.ownerDocument.defaultView!.PointerEvent ?? node.ownerDocument.defaultView!.MouseEvent;
    node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, detail: 0, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey }));
  };
  return {
    onkeydown(event: KeyboardEvent) {
      if (native() || event.target !== event.currentTarget || event.defaultPrevented) return;
      if (disabled()) {
        if (event.key === ' ' || event.key === 'Enter') event.preventDefault();
        return;
      }
      const node = event.currentTarget as HTMLElement;
      const link = node.tagName === 'A' && node.hasAttribute('href');
      if (event.key === ' ') event.preventDefault();
      else if (event.key === 'Enter' && !link) { event.preventDefault(); dispatch(event); }
    },
    onkeyup(event: KeyboardEvent) {
      if (!disabled() && !native() && event.target === event.currentTarget && !event.defaultPrevented && event.key === ' ') dispatch(event);
    },
  };
}
