// Base UI v1.8.0 Fieldset adaptation; MIT: THIRD_PARTY_NOTICES.md.
import type { HTMLAttributes, HTMLFieldsetAttributes } from 'svelte/elements';
import type { NativeFieldProps } from '../field/props.js';
export interface FieldsetRootState { disabled: boolean }
export type FieldsetRootProps = NativeFieldProps<FieldsetRootState, HTMLFieldsetAttributes>;
export interface FieldsetLegendState { disabled: boolean }
export type FieldsetLegendProps = NativeFieldProps<FieldsetLegendState, HTMLAttributes<HTMLDivElement>>;
