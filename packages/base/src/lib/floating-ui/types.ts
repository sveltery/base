// Native representations of Base UI v1.8.0 floating root/tree interaction types.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import type { VirtualElement, Placement, Strategy, MiddlewareData } from '@floating-ui/dom';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { HTMLProps } from '../internals/types.js';
import type { FloatingRootStore } from './components/FloatingRootStore.svelte.js';
import type { FloatingTreeStore } from './components/FloatingTreeStore.js';
export interface FloatingEvents {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Original shared interaction event bus carries component-specific payloads.
  emit<T extends string>(event: T, data?: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Original shared interaction event bus carries component-specific payloads.
  on(event: string, handler: (data: any) => void): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Original shared interaction event bus carries component-specific payloads.
  off(event: string, handler: (data: any) => void): void;
}
export interface ContextData {
  openEvent?: Event;
  floatingContext?: FloatingContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Original dataRef is open shared interaction bookkeeping.
  [key: string]: any;
}
export type ReferenceType = Element | VirtualElement;
export type FloatingRootContext = FloatingRootStore;
export interface FloatingContext {
  readonly open: boolean;
  onOpenChange(open: boolean, details: BaseUIChangeEventDetails<string>): void;
  readonly events: FloatingEvents;
  readonly dataRef: { current: ContextData };
  readonly nodeId: string | undefined;
  readonly floatingId: string | undefined;
  readonly rootStore: FloatingRootStore;
  readonly refs: {
    domReference: { current: Element | null };
    floating: { current: HTMLElement | null };
  };
  readonly elements: {
    domReference: Element | null;
    reference: ReferenceType | null;
    floating: HTMLElement | null;
  };
}
/** Original positioned context. Root-only Dialog interaction contexts remain geometry-free. */
export interface PositionedFloatingContext extends FloatingContext {
  readonly x: number;
  readonly y: number;
  readonly placement: Placement;
  readonly strategy: Strategy;
  readonly middlewareData: MiddlewareData;
  readonly isPositioned: boolean;
  readonly floatingStyles: Record<string, string | undefined>;
  update(): Promise<void>;
  readonly refs: FloatingContext['refs'] & {
    reference: { current: ReferenceType | null };
    setReference(node: ReferenceType | null): void;
    setPositionReference(node: ReferenceType | null): void;
    setFloating(node: HTMLElement | null): void;
  };
}
export interface FloatingNodeType {
  id: string | undefined;
  parentId: string | null;
  context?: FloatingContext;
}
export type FloatingTreeType = FloatingTreeStore;
export interface ElementProps {
  reference?: HTMLProps;
  floating?: HTMLProps;
  item?: HTMLProps;
  trigger?: HTMLProps;
}
export interface FloatingUIOpenChangeDetails {
  open: boolean;
  reason: string;
  nativeEvent: Event;
  nested: boolean;
  triggerElement?: Element;
}

// Selected Original hover type boundaries; SafePolygonOptions has one canonical definition.
export type Delay = number | Partial<{ open: number; close: number }>;
export type ExtendedElements = FloatingContext['elements'];
export type { Placement } from '@floating-ui/dom';
export type { SafePolygonOptions } from './safePolygon.js';
