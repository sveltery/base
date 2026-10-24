// Derived from react-day-picker v9.8.1 src/types/props.ts and src/types/shared.ts
// (commit bd55df2e3a4917f4c368020f3ef64f60b6882627). MIT, see THIRD_PARTY_NOTICES.md.

import type { Locale } from 'date-fns';
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLThAttributes } from 'svelte/elements';

/** A range of dates. `to` is unset while the user has picked only the start. */
export type DateRange = { from: Date | undefined; to?: Date | undefined };

/** Matches the days before `before`. */
export type DateBefore = { before: Date };
/** Matches the days after `after`. */
export type DateAfter = { after: Date };
/** Matches the days between `after` and `before`, both excluded. When `after` is later than `before`, matches the days outside them. */
export type DateInterval = { before: Date; after: Date };
/** Matches the days of the week, `0` for Sunday to `6` for Saturday. */
export type DayOfWeek = { dayOfWeek: number | number[] };

/** Describes a set of days, as in react-day-picker's `disabled`, `hidden` and `modifiers` props. */
export type Matcher =
	| boolean
	| ((date: Date) => boolean)
	| Date
	| Date[]
	| DateRange
	| DateBefore
	| DateAfter
	| DateInterval
	| DayOfWeek;

export type Mode = 'single' | 'multiple' | 'range';

export type CaptionLayout = 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years';

export type DayFlag = 'disabled' | 'hidden' | 'outside' | 'focused' | 'today';
export type SelectionState = 'selected' | 'range_start' | 'range_middle' | 'range_end';

/**
 * What applies to a day: the built-in flags, the selection states and the custom `modifiers`.
 * `selected` is set only on a selected day, and the range states only while `selected` is a range.
 */
export type Modifiers = Record<DayFlag, boolean> & Partial<Record<string, boolean>>;

/** A day in the grid. An outside day belongs to the month before or after `displayMonth`. */
export interface CalendarDay {
	readonly date: Date;
	readonly displayMonth: Date;
	readonly outside: boolean;
	/** `yyyy-MM-dd`. */
	readonly isoDate: string;
	/** `yyyy-MM` of `displayMonth`. */
	readonly displayMonthId: string;
	/** `yyyy-MM` of `date`. */
	readonly dateMonthId: string;
}

export interface CalendarWeek {
	readonly weekNumber: number;
	readonly days: CalendarDay[];
}

export interface CalendarMonth {
	/** The first day of the month. */
	readonly date: Date;
	readonly weeks: CalendarWeek[];
}

export type MoveFocusBy = 'day' | 'week' | 'month' | 'year' | 'startOfWeek' | 'endOfWeek';
export type MoveFocusDir = 'before' | 'after';

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateLibOptions {
	/** A date-fns locale. Defaults to `enUS`. */
	locale?: Locale;
	weekStartsOn?: WeekStartsOn;
	firstWeekContainsDate?: 1 | 4;
	/** An IANA time zone. Dates are created and compared in it. */
	timeZone?: string;
}

/** The options that shape the grid and its navigation. */
export interface GridOptions {
	numberOfMonths?: number;
	fixedWeeks?: boolean;
	ISOWeek?: boolean;
	/** The earliest month the user can navigate to. */
	startMonth?: Date;
	/** The latest month the user can navigate to. */
	endMonth?: Date;
	captionLayout?: CaptionLayout;
	pagedNavigation?: boolean;
	reverseMonths?: boolean;
	disableNavigation?: boolean;
	today?: Date;
}

/** The element keys of `classNames`, with react-day-picker's names. */
export type UI =
	| 'root'
	| 'chevron'
	| 'day'
	| 'day_button'
	| 'caption_label'
	| 'dropdowns'
	| 'dropdown'
	| 'dropdown_root'
	| 'footer'
	| 'month_grid'
	| 'month_caption'
	| 'months_dropdown'
	| 'month'
	| 'months'
	| 'nav'
	| 'button_next'
	| 'button_previous'
	| 'week'
	| 'weeks'
	| 'weekday'
	| 'weekdays'
	| 'week_number'
	| 'week_number_header'
	| 'years_dropdown';

export type ClassNames = Record<UI | DayFlag | SelectionState, string>;

export interface DropdownOption {
	value: number;
	label: string;
	disabled: boolean;
}

export interface Formatters {
	formatCaption: (month: Date, lib: DateLibLike) => string;
	formatDay: (date: Date, lib: DateLibLike) => string;
	formatMonthDropdown: (month: Date, lib: DateLibLike) => string;
	formatYearDropdown: (year: Date, lib: DateLibLike) => string;
	formatWeekdayName: (weekday: Date, lib: DateLibLike) => string;
	formatWeekNumber: (weekNumber: number, lib: DateLibLike) => string;
	formatWeekNumberHeader: () => string;
}

export interface Labels {
	labelDayButton: (date: Date, modifiers: Modifiers, lib: DateLibLike) => string;
	labelGridcell: (date: Date, modifiers: Modifiers, lib: DateLibLike) => string;
	labelGrid: (month: Date, lib: DateLibLike) => string;
	labelMonthDropdown: () => string;
	labelYearDropdown: () => string;
	labelNav: () => string;
	labelNext: (month: Date | undefined) => string;
	labelPrevious: (month: Date | undefined) => string;
	labelWeekday: (weekday: Date, lib: DateLibLike) => string;
	labelWeekNumber: (weekNumber: number) => string;
	labelWeekNumberHeader: () => string;
}

/** The formatting surface formatters and labels receive. `DateLib` implements it. */
export interface DateLibLike {
	readonly options: DateLibOptions;
	format: (date: Date, pattern: string) => string;
}

export type DayEventHandler<E extends Event> = (date: Date, modifiers: Modifiers, event: E) => void;

export interface DayButtonSnippetProps {
	day: CalendarDay;
	modifiers: Modifiers;
	/** Spread onto the button. Holds the handlers, ARIA, `tabindex` and the attachment that moves focus to it. */
	props: Omit<HTMLButtonAttributes, 'disabled'> & { disabled: true | undefined };
	/** The formatted day, such as `12`. */
	text: string;
}

export interface WeekNumberSnippetProps {
	week: CalendarWeek;
	/** Spread onto the cell. */
	props: HTMLThAttributes;
	/** The formatted week number, such as `07`. */
	text: string;
}

export interface ChevronSnippetProps {
	orientation: 'left' | 'right' | 'up' | 'down';
	class: string;
	/** Width and height in pixels. Set to `18` in the caption dropdowns, otherwise unset for a 24px icon. */
	size?: number;
	/** Set on the chevron of a disabled navigation button. */
	disabled?: true;
}

export interface RootSnippetProps {
	/** Spread onto the root element. `children` renders the months and the footer. */
	props: HTMLAttributes<HTMLDivElement> & { children: Snippet };
}

/** The attributes react-day-picker forwards to its root element, plus any `data-*` attribute. */
type RootAttributes = Pick<
	HTMLAttributes<HTMLDivElement>,
	'class' | 'style' | 'id' | 'lang' | 'title' | 'role' | 'aria-label'
> & {
	nonce?: string;
	[key: `data-${string}`]: unknown;
};

interface CommonProps extends RootAttributes {
	/** The first displayed month. Use `bind:month` to read or drive it. */
	month?: Date;
	/** The month shown first when `month` is unset. Read once, at mount. Defaults to the month of `today`. */
	defaultMonth?: Date;
	/** Called after the displayed month changes, with the new first month. */
	onMonthChange?: (month: Date) => void;
	/** The earliest month the user can navigate to. */
	startMonth?: Date;
	/** The latest month the user can navigate to. */
	endMonth?: Date;
	/** How many months to show. @default 1 */
	numberOfMonths?: number;
	/** Move by `numberOfMonths` instead of one month. */
	pagedNavigation?: boolean;
	/** Show the months in reverse order. */
	reverseMonths?: boolean;
	/** Disable the navigation buttons and the dropdowns. */
	disableNavigation?: boolean;
	/** Do not render the navigation buttons. */
	hideNavigation?: boolean;
	/** `around` puts the buttons around the caption instead of in a shared nav. */
	navLayout?: 'around' | 'after';
	/** Show the caption as a label, or as month and year dropdowns. @default 'label' */
	captionLayout?: CaptionLayout;
	/** Always render six weeks per month. */
	fixedWeeks?: boolean;
	/** Use ISO weeks: Monday first, ISO week numbers. */
	ISOWeek?: boolean;
	/** Show the days of the months before and after. */
	showOutsideDays?: boolean;
	/** Show a column of week numbers. */
	showWeekNumber?: boolean;
	/** Do not render the weekday header row. */
	hideWeekdays?: boolean;
	/** Days that can't be selected. */
	disabled?: Matcher | Matcher[];
	/** Days that are not rendered. */
	hidden?: Matcher | Matcher[];
	/** Custom modifiers. Each name becomes a `Modifiers` key, and the day gets its class from `modifiersClassNames`. */
	modifiers?: Record<string, Matcher | Matcher[] | undefined>;
	/** The class added to a day for each custom or built-in modifier. */
	modifiersClassNames?: Record<string, string>;
	/** The day marked as today. Defaults to the current date in `timeZone`. */
	today?: Date;
	/** A date-fns locale. */
	locale?: Locale;
	/** The first day of the week, `0` for Sunday. Defaults to the locale's. */
	weekStartsOn?: WeekStartsOn;
	/** The day of January that the first week must contain. Defaults to the locale's. */
	firstWeekContainsDate?: 1 | 4;
	/** An IANA time zone, such as `America/New_York`. Days are computed in it. */
	timeZone?: string;
	/** The text direction. It also flips the arrow keys. */
	dir?: 'ltr' | 'rtl';
	/** Focus the focus target when the calendar mounts. */
	autofocus?: boolean;
	/** The class of each part and modifier, replacing `defaultClassNames`. */
	classNames?: Partial<ClassNames>;
	/** Replace the functions that format the caption, days, weekdays and week numbers. */
	formatters?: Partial<Formatters>;
	/** Replace the functions that build the ARIA labels. */
	labels?: Partial<Labels>;
	/** Called when a day is clicked. */
	onDayClick?: DayEventHandler<MouseEvent>;
	/** Called when a day gains focus. */
	onDayFocus?: DayEventHandler<FocusEvent>;
	/** Called when a day loses focus. */
	onDayBlur?: DayEventHandler<FocusEvent>;
	/** Called on a key press on a day. */
	onDayKeyDown?: DayEventHandler<KeyboardEvent>;
	/** Called when the pointer enters a day. */
	onDayMouseEnter?: DayEventHandler<MouseEvent>;
	/** Called when the pointer leaves a day. */
	onDayMouseLeave?: DayEventHandler<MouseEvent>;
	/** Called when the next button moves the month. */
	onNextClick?: (month: Date) => void;
	/** Called when the previous button moves the month. */
	onPrevClick?: (month: Date) => void;
	/** Replaces the root element. Spread `props` onto it and render `props.children` inside. */
	root?: Snippet<[RootSnippetProps]>;
	/** Replaces the chevron icon in the navigation buttons and dropdowns. */
	chevron?: Snippet<[ChevronSnippetProps]>;
	/** Replaces the button inside each selectable day. */
	dayButton?: Snippet<[DayButtonSnippetProps]>;
	/** Replaces the week number cell. */
	weekNumber?: Snippet<[WeekNumberSnippetProps]>;
	/** Content shown below the months, announced as a live region. */
	footer?: Snippet;
}

type SelectHandler<T> = (
	selected: T,
	triggerDate: Date,
	modifiers: Modifiers,
	event: MouseEvent
) => void;

interface NoSelection {
	required?: never;
	min?: never;
	max?: never;
	excludeDisabled?: never;
}

export interface SingleProps extends Omit<NoSelection, 'required'> {
	/** How days are selected: one day, several days or a range. Unset, days are not selectable. */
	mode: 'single';
	/** Use `bind:selected` to read or drive it. */
	selected?: Date;
	/** The day selected first when `selected` is unset. Read once, at mount. */
	defaultSelected?: Date;
	/** Keep a date selected: clicking the selected day does not clear it. */
	required?: boolean;
	/** Called after a click changes the selection, with the new selection. */
	onSelect?: SelectHandler<Date | undefined>;
}

export interface MultipleProps extends Omit<NoSelection, 'required' | 'min' | 'max'> {
	mode: 'multiple';
	selected?: Date[];
	/** The days selected first when `selected` is unset. Read once, at mount. */
	defaultSelected?: Date[];
	required?: boolean;
	/** The fewest days that can stay selected. */
	min?: number;
	/** The most days that can be selected. */
	max?: number;
	onSelect?: SelectHandler<Date[] | undefined>;
}

export interface RangeProps {
	mode: 'range';
	selected?: DateRange;
	/** The range selected first when `selected` is unset. Read once, at mount. */
	defaultSelected?: DateRange;
	required?: boolean;
	/** The fewest nights a range spans. */
	min?: number;
	/** The most nights a range spans. */
	max?: number;
	/** Restart the range when it would include a disabled day. */
	excludeDisabled?: boolean;
	onSelect?: SelectHandler<DateRange | undefined>;
}

export interface NoModeProps extends NoSelection {
	mode?: undefined;
	selected?: undefined;
	defaultSelected?: undefined;
	onSelect?: undefined;
}

export type DayPickerProps = CommonProps & (SingleProps | MultipleProps | RangeProps | NoModeProps);
