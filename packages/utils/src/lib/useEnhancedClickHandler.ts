// Original Base UI v1.8.0 useEnhancedClickHandler business body with native event names (MIT).
export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';

/** Records pointerdown on browsers whose click event does not expose pointerType. */
export class EnhancedClickHandler {
  private readonly lastClickInteractionTypeRef = { current: '' as InteractionType };

  constructor(
    private readonly handler: (
      event: MouseEvent | PointerEvent,
      interactionType: InteractionType,
    ) => void,
  ) {}

  readonly onpointerdown = (event: PointerEvent) => {
    if (event.defaultPrevented) return;
    this.lastClickInteractionTypeRef.current = event.pointerType as InteractionType;
    this.handler(event, event.pointerType as InteractionType);
  };

  readonly onclick = (event: MouseEvent | PointerEvent) => {
    if (event.detail === 0) {
      this.handler(event, 'keyboard');
      return;
    }
    if ('pointerType' in event) this.handler(event, event.pointerType as InteractionType);
    else this.handler(event, this.lastClickInteractionTypeRef.current);
    this.lastClickInteractionTypeRef.current = '';
  };
}

export function useEnhancedClickHandler(
  handler: (event: MouseEvent | PointerEvent, interactionType: InteractionType) => void,
) {
  const { onclick, onpointerdown } = new EnhancedClickHandler(handler);
  return { onclick, onpointerdown };
}
