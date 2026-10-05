// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { FloatingNodeType, FloatingEvents } from '../types.js';
import { createEventEmitter } from '../utils/createEventEmitter.js';

/**
 * Stores and manages floating elements in a tree structure.
 * This is a backing store for the `FloatingTree` component.
 */
export class FloatingTreeStore {
  public readonly nodesRef: { current: Array<FloatingNodeType> } = { current: [] };

  public readonly events: FloatingEvents = createEventEmitter();

  public addNode(node: FloatingNodeType) {
    this.nodesRef.current.push(node);
  }

  public removeNode(node: FloatingNodeType) {
    const index = this.nodesRef.current.findIndex((n) => n === node);
    if (index !== -1) {
      this.nodesRef.current.splice(index, 1);
    }
  }
}
