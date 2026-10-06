// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-explicit-any -- Original generic event bus accepts component-specific payloads. */
import type { FloatingEvents } from '../types.js';

export function createEventEmitter(): FloatingEvents {
  const map = new Map<string, Set<(data: any) => void>>();
  return {
    emit(event: string, data: any) {
      map.get(event)?.forEach((listener) => listener(data));
    },
    on(event: string, listener: (data: any) => void) {
      if (!map.has(event)) {
        map.set(event, new Set());
      }
      map.get(event)!.add(listener);
    },
    off(event: string, listener: (data: any) => void) {
      map.get(event)?.delete(listener);
    },
  };
}
