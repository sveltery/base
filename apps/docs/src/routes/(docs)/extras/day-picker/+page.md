# Day Picker

<Subtitle>
  A calendar that shows one or more months and selects a single day, several days or a range.
</Subtitle>

<Meta name="description" content="A calendar that shows one or more months and selects a single day, several days or a range." />

<DemoDayPickerHero />

## Installation

Day Picker computes dates with [date-fns](https://date-fns.org) and time zones with [@date-fns/tz](https://github.com/date-fns/tz). Both are optional peer dependencies of `@sveltery/base`, so install them next to it:

```bash
npm install date-fns @date-fns/tz
```

Import Day Picker from its subpath. The `@sveltery/base` root entry does not export it.

## Anatomy

Import the component and use it as a single part:

```svelte title="Anatomy"
<script lang="ts">
	import { DayPicker } from '@sveltery/base/day-picker';
</script>

<DayPicker />
```

Day Picker ports [react-day-picker](https://daypicker.dev) v9.8.1 and takes its props. `bind:selected` holds a `Date` in `single` mode, a `Date[]` in `multiple` mode and a `{ from, to }` range in `range` mode. `bind:month` holds the first displayed month. `defaultSelected` and `defaultMonth` set the starting value of an empty binding. The `root`, `chevron`, `dayButton`, `weekNumber` and `footer` snippets replace react-day-picker's `components`.

## API reference

<script>
	import { DemoDayPickerHero } from './demos/hero';
	import { TypesDayPicker } from './types';
</script>

<TypesDayPicker />
