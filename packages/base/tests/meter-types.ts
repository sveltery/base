import type { MeterRootProps, MeterRootState, MeterLabelProps, MeterLabelState, MeterTrackProps, MeterTrackState, MeterIndicatorProps, MeterIndicatorState, MeterValueProps, MeterValueState } from '../src/lib/meter/index.js';
import type { Snippet } from 'svelte';

const root: MeterRootProps = { value: NaN, min: 0, max: 100, locale: ['de-DE', 'en-US'], format: { style: 'percent' }, getAriaValueText: (formatted, raw) => `${formatted}:${raw}`, class: state => [Object.keys(state), { active: true }], style: state => `opacity:${Object.keys(state).length + 1}`, ref: undefined };
const state: MeterRootState = {};
const partStates: [MeterLabelState, MeterTrackState, MeterIndicatorState, MeterValueState] = [state, state, state, state];
// @ts-expect-error The current numeric value is required.
const missing: MeterRootProps = {};
// @ts-expect-error Meter has no indeterminate null value.
const nullable: MeterRootProps = { value: null };
// @ts-expect-error Meter accepts a number, not a numeric string.
const stringValue: MeterRootProps = { value: '50' };
// @ts-expect-error Meter state is empty and cannot carry a Progress status.
const status: MeterRootState = { status: 'complete' };
declare const child: Snippet<[string, number]>;
const value: MeterValueProps = { children: child };
const defaultValue: MeterValueProps = { children: null };
const parts: [MeterLabelProps, MeterTrackProps, MeterIndicatorProps] = [{}, {}, {}];
void [root, state, partStates, missing, nullable, stringValue, status, value, defaultValue, parts];
