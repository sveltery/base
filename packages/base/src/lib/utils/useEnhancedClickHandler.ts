// Original Base UI v1.8.0 useEnhancedClickHandler business body with native event names (MIT).
export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';

/** Records pointerdown on browsers whose click event does not expose pointerType. */
export function useEnhancedClickHandler(
  handler: (event: MouseEvent | PointerEvent, interactionType: InteractionType) => void,
) {
  const lastClickInteractionTypeRef = { current: '' as InteractionType };
  function onpointerdown(event: PointerEvent) {
    if (event.defaultPrevented) return;
    lastClickInteractionTypeRef.current = event.pointerType as InteractionType;
    handler(event, event.pointerType as InteractionType);
  }
  function onclick(event: MouseEvent | PointerEvent) {
    if (event.detail === 0) {
      handler(event, 'keyboard');
      return;
    }
    if ('pointerType' in event) handler(event, event.pointerType as InteractionType);
    else handler(event, lastClickInteractionTypeRef.current);
    lastClickInteractionTypeRef.current = '';
  }
  return { onclick, onpointerdown };
}
