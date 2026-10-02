import type { Progress, Status, ProgressRootProps, ProgressStatus, ProgressValueProps, ProgressLabelProps, ProgressTrackProps, ProgressIndicatorProps } from '../src/lib/progress/index.js';
import type { Snippet } from 'svelte';
const root: ProgressRootProps = { value: null, min: 0, max: 100, locale: ['de-DE', 'en-US'], format: { style: 'percent' }, getAriaValueText: (formatted, raw) => `${formatted}:${raw}`, class: state => [state.status, { active: true }], ref: undefined };
const state: ProgressStatus = 'indeterminate';
const namespaceStatus: Progress.Status = state;
const subpathStatus: Status = namespaceStatus;
// @ts-expect-error The current value is required.
const missing: ProgressRootProps = {};
// @ts-expect-error Status is a bounded public union.
const invalid: ProgressStatus = 'loading';
declare const child: Snippet<[string | null, number | null]>;
const value: ProgressValueProps = { children: child };
const parts: [ProgressLabelProps, ProgressTrackProps, ProgressIndicatorProps] = [{}, {}, {}];
void [root, state, namespaceStatus, subpathStatus, missing, invalid, value, parts];
