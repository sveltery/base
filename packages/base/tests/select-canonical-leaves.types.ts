import type { ComponentProps, Snippet } from 'svelte';
import type { HTMLProps } from '../src/lib/internals/types.js';
import type { ItemEqualityComparer } from '../src/lib/internals/itemEquality.js';
import { compareItemEquality, findSelectionIndex } from '../src/lib/internals/itemEquality.js';
import {
  resolveMultipleLabels,
  type Group,
  type ValueLabel,
} from '../src/lib/internals/resolveValueLabel.js';
import ListboxSeparator from '../src/lib/utils/listbox-separator/ListboxSeparator.svelte';
import type {
  ListboxSeparatorProps,
  ListboxSeparatorState,
} from '../src/lib/utils/listbox-separator/types.js';
import { expectType } from './expect-type.js';

type Props = ComponentProps<typeof ListboxSeparator>;
function check(props: Props) {
  expectType<ListboxSeparatorProps, Props>(props);
}
declare const render: Snippet<[HTMLProps, ListboxSeparatorState, Snippet | undefined]>;
declare const label: Snippet;
const props: Props = {
  orientation: 'vertical',
  ref: undefined,
  render,
  class: (state) => ['separator', { vertical: state.orientation === 'vertical' }],
  style: (state) => `opacity:${state.orientation === 'vertical' ? 1 : 0.5}`,
  onclick(event) {
    const current: HTMLDivElement = event.currentTarget;
    event.preventBaseUIHandler();
    void current;
  },
};
// @ts-expect-error The Source orientation union is preserved.
const badOrientation: Props = { orientation: 'diagonal' };
// @ts-expect-error Style callback receives the real ListboxSeparator state.
const badStyle: Props = {
  style: (state: { selected: boolean }) => `opacity:${state.selected ? 1 : 0}`,
};
// @ts-expect-error Children use native authored Snippets.
const badChildren: Props = { children: 'text' };
// @ts-expect-error Native event inference remains specific to the actual div.
const badEvent: Props = {
  onclick(event: KeyboardEvent) {
    void event;
  },
};
const grouped: readonly Group<{ value: string; label: ValueLabel }>[] = [
  { heading: 'Labels', items: [{ value: 'a', label }] },
];
const labels: ValueLabel[] = resolveMultipleLabels(['a'], grouped);
const compare: ItemEqualityComparer<{ id: number }, number> = (item, value) => item.id === value;
const match: boolean = compareItemEquality({ id: 1 }, 1, compare);
const index: number | null = findSelectionIndex([{ id: 1 }], [1], compare, true);
// @ts-expect-error Comparer selected-value argument remains correlated.
compareItemEquality({ id: 1 }, 'one', compare);
// @ts-expect-error Native label values do not accept a React element-shaped object.
const badLabel: ValueLabel = { type: 'div', props: {} };
void [
  check,
  props,
  badOrientation,
  badStyle,
  badChildren,
  badEvent,
  labels,
  match,
  index,
  badLabel,
];
