// Ten adapted upstream type assertions are recorded separately from ordinary test declarations.
// Source: CollapsibleRoot.spec.tsx, Base UI v1.8.0; MIT: parity/collapsible/UPSTREAM_LICENSE.
import type { ComponentProps } from 'svelte';
import {
  Root,
  Trigger,
  Panel,
  type CollapsibleRootProps,
  type CollapsibleTriggerProps,
  type CollapsiblePanelProps,
  type CollapsibleRootState,
  type CollapsibleTriggerState,
  type CollapsiblePanelState,
  type CollapsibleRootChangeEventReason,
  type CollapsibleRootChangeEventDetails,
} from '../src/lib/collapsible/index.js';
import { expectType } from './expect-type.js';
const rootProps = {} as ComponentProps<typeof Root>;
const triggerProps = {} as ComponentProps<typeof Trigger>;
const panelProps = {} as ComponentProps<typeof Panel>;
const rootState = {} as CollapsibleRootState;
const triggerState = {} as CollapsibleTriggerState;
const panelState = {} as CollapsiblePanelState;
expectType<CollapsibleRootProps, typeof rootProps>(rootProps);
expectType<CollapsibleTriggerProps, typeof triggerProps>(triggerProps);
expectType<CollapsiblePanelProps, typeof panelProps>(panelProps);
expectType<CollapsibleRootState, typeof rootState>(rootState);
expectType<CollapsibleTriggerState, typeof triggerState>(triggerState);
expectType<CollapsiblePanelState, typeof panelState>(panelState);
export const handleOpenChange: NonNullable<CollapsibleRootProps['onOpenChange']> = (
  open,
  details,
) => {
  expectType<boolean, typeof open>(open);
  expectType<CollapsibleRootChangeEventDetails, typeof details>(details);
};
const reason = null as unknown as CollapsibleRootChangeEventReason;
const details = null as unknown as CollapsibleRootChangeEventDetails;
expectType<CollapsibleRootChangeEventReason, typeof reason>(reason);
expectType<CollapsibleRootChangeEventDetails, typeof details>(details);
// Supplemental public Svelte API assertions below earn no upstream type assertion or declaration credit.
export const consumer: CollapsibleRootProps = {
  defaultOpen: false,
  open: true,
  disabled: false,
  ref: undefined,
  class: (state) => (state.open ? 'open' : undefined),
  style: (state) => `opacity:${state.disabled ? 0.5 : 1}`,
  onOpenChange: handleOpenChange,
};
export const triggerConsumer: CollapsibleTriggerProps = {
  nativeButton: true,
  disabled: false,
  type: 'submit',
  form: 'external-form',
  value: 'sent',
  onclick: (event) => event.preventBaseUIHandler(),
};
export const panelConsumer: CollapsiblePanelProps = {
  keepMounted: true,
  hiddenUntilFound: true,
  style: (state) => (state.transitionStatus === 'idle' ? 'height:auto' : ''),
};
// @ts-expect-error Collapsible.Root does not expose an actions API.
export const actions: CollapsibleRootProps = { actions: {} };
// @ts-expect-error Collapsible.Root does not expose onOpenChangeComplete.
export const complete: CollapsibleRootProps = { onOpenChangeComplete: () => {} };
// @ts-expect-error Trigger fixes focusableWhenDisabled=true without a public option.
export const focusability: CollapsibleTriggerProps = { focusableWhenDisabled: false };
