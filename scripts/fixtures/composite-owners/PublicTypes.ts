import type * as Root from '@sveltery/base';
import type * as Radio from '@sveltery/base/radio';
import type * as Group from '@sveltery/base/radio-group';
import type * as ToggleGroup from '@sveltery/base/toggle-group';
import type * as Toolbar from '@sveltery/base/toolbar';
import type * as Menubar from '@sveltery/base/menubar';
import type * as Menu from '@sveltery/base/menu';
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
export type PublicCorrespondence = [
  Assert<Equal<Root.RadioRootProps<number>, Radio.RadioRootProps<number>>>,
  Assert<Equal<Root.RadioGroupProps<number>, Group.RadioGroupProps<number>>>,
  Assert<Equal<Root.ToggleGroupProps<'a'>, ToggleGroup.ToggleGroupProps<'a'>>>,
  Assert<Equal<Root.ToolbarButtonProps, Toolbar.ToolbarButtonProps>>,
  Assert<Equal<Root.MenubarProps, Menubar.Menubar.Props>>,
  Assert<Equal<Root.MenuRootProps<number>, Menu.Root.Props<number>>>,
];
const numeric: Root.RadioGroupProps<number> = {
  value: 1,
  onValueChange(value, details) {
    const number: number = value;
    const event: Event = details.event;
    void [number, event];
  },
};
const group: Root.ToggleGroupProps<'a' | 'b'> = {
  value: ['a'],
  onValueChange(value) {
    const values: ('a' | 'b')[] = value;
    void values;
  },
};
// @ts-expect-error Generic radio values cannot silently widen to strings.
const wrongRadio: Root.RadioGroupProps<number> = { value: 'wrong' };
// @ts-expect-error Group values retain their item union.
const wrongToggle: Root.ToggleGroupProps<'a'> = { value: ['b'] };
// @ts-expect-error Composite orientation is not arbitrary text.
const wrongToolbar: Root.ToolbarRootProps = { orientation: 'diagonal' };
// @ts-expect-error Native element bindings reject React callback refs.
const callbackRef: Root.RadioRootProps = { value: 'a', ref: () => {} };
// @ts-expect-error Menubar boolean props reject null.
const wrongMenubar: Root.MenubarProps = { loopFocus: null };
// @ts-expect-error Menu public state cannot be controlled with a string.
const wrongMenu: Root.MenuRootProps = { open: 'true' };
void [numeric, group, wrongRadio, wrongToggle, wrongToolbar, callbackRef, wrongMenubar, wrongMenu];
