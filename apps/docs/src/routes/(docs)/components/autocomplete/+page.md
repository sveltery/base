# Autocomplete

<Subtitle>
  An input that suggests options as you type.
</Subtitle>

<Meta name="description" content="An input that suggests options as you type." />

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	interface Tag {
		id: string;
		value: string;
	}

	const tags: Tag[] = [
		{ id: 't1', value: 'feature' },
		{ id: 't2', value: 'fix' },
		{ id: 't3', value: 'bug' },
		{ id: 't4', value: 'docs' },
		{ id: 't5', value: 'internal' },
		{ id: 't6', value: 'mobile' },
		{ id: 'c-accordion', value: 'component: accordion' },
		{ id: 'c-alert-dialog', value: 'component: alert dialog' },
		{ id: 'c-autocomplete', value: 'component: autocomplete' },
		{ id: 'c-avatar', value: 'component: avatar' },
		{ id: 'c-checkbox', value: 'component: checkbox' },
		{ id: 'c-checkbox-group', value: 'component: checkbox group' },
		{ id: 'c-collapsible', value: 'component: collapsible' },
		{ id: 'c-combobox', value: 'component: combobox' },
		{ id: 'c-context-menu', value: 'component: context menu' },
		{ id: 'c-dialog', value: 'component: dialog' },
		{ id: 'c-field', value: 'component: field' },
		{ id: 'c-fieldset', value: 'component: fieldset' },
		{ id: 'c-filterable-menu', value: 'component: filterable menu' },
		{ id: 'c-form', value: 'component: form' },
		{ id: 'c-input', value: 'component: input' },
		{ id: 'c-menu', value: 'component: menu' },
		{ id: 'c-menubar', value: 'component: menubar' },
		{ id: 'c-meter', value: 'component: meter' },
		{ id: 'c-navigation-menu', value: 'component: navigation menu' },
		{ id: 'c-number-field', value: 'component: number field' },
		{ id: 'c-popover', value: 'component: popover' },
		{ id: 'c-preview-card', value: 'component: preview card' },
		{ id: 'c-progress', value: 'component: progress' },
		{ id: 'c-radio', value: 'component: radio' },
		{ id: 'c-scroll-area', value: 'component: scroll area' },
		{ id: 'c-select', value: 'component: select' },
		{ id: 'c-separator', value: 'component: separator' },
		{ id: 'c-slider', value: 'component: slider' },
		{ id: 'c-switch', value: 'component: switch' },
		{ id: 'c-tabs', value: 'component: tabs' },
		{ id: 'c-toast', value: 'component: toast' },
		{ id: 'c-toggle', value: 'component: toggle' },
		{ id: 'c-toggle-group', value: 'component: toggle group' },
		{ id: 'c-toolbar', value: 'component: toolbar' },
		{ id: 'c-tooltip', value: 'component: tooltip' }
	];
</script>

<Autocomplete.Root items={tags}>
	<label class="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
		Search tags
		<Autocomplete.Input
			placeholder="e.g. feature"
			class="h-8 w-[16rem] border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:opacity-100 placeholder:text-neutral-500 placeholder:[-webkit-text-fill-color:var(--color-neutral-500)] dark:placeholder:text-neutral-400 dark:placeholder:[-webkit-text-fill-color:var(--color-neutral-400)] focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
			<Autocomplete.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Autocomplete.Empty>
					<div class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No tags found.
					</div>
				</Autocomplete.Empty>
				<Autocomplete.List
					class="outline-0 overflow-y-auto scroll-py-[0.25rem] py-1 overscroll-contain max-h-[min(22.5rem,var(--available-height))] data-empty:p-0"
				>
					<Autocomplete.Collection>
						{#snippet children(tag: Tag)}
							<Autocomplete.Item
								value={tag}
								class="flex cursor-default items-center gap-2 py-2 pr-2 pl-2 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
							>
								{tag.value}
							</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

## Usage guidelines

- **Avoid when selection state is needed**: Use [Combobox](/components/combobox) instead of Autocomplete if the selection should be remembered and the input value cannot be custom. Unlike Combobox, Autocomplete's input can contain free-form text, as its suggestions only _optionally_ autocomplete the text.
- **Can be used for filterable command pickers**: The input can be used as a filter for command items that perform an action when clicked when rendered inside the popup.
- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [Manual unmounting](/handbook/animation#manual-unmounting) for animating it with a JavaScript library and for manual control.

## Anatomy

Import the components and place them together:

```svelte title="Anatomy"
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
</script>

<Autocomplete.Root>
	<Autocomplete.InputGroup>
		<Autocomplete.Input />
		<Autocomplete.Trigger />
		<Autocomplete.Icon />
		<Autocomplete.Clear />
		<Autocomplete.Value />
	</Autocomplete.InputGroup>

	<Autocomplete.Portal>
		<Autocomplete.Backdrop />
		<Autocomplete.Positioner>
			<Autocomplete.Popup>
				<Autocomplete.Arrow />

				<Autocomplete.Status />
				<Autocomplete.Empty />

				<Autocomplete.List>
					<Autocomplete.Row>
						<Autocomplete.Item />
					</Autocomplete.Row>

					<Autocomplete.Separator />

					<Autocomplete.Group>
						<Autocomplete.GroupLabel />
					</Autocomplete.Group>

					<Autocomplete.Collection />
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

## Item values

Each `<Autocomplete.Item>` takes a `value` prop identifying it. Pass the item being rendered, so that props like `itemToStringValue` receive it.

## Examples

### Async search

Load items asynchronously while typing and render custom status content.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	interface Movie {
		id: string;
		title: string;
		year: number;
	}

	const top100Movies: Movie[] = [
		{ id: '1', title: 'The Shawshank Redemption', year: 1994 },
		{ id: '2', title: 'The Godfather', year: 1972 },
		{ id: '3', title: 'The Dark Knight', year: 2008 },
		{ id: '4', title: 'The Godfather Part II', year: 1974 },
		{ id: '5', title: '12 Angry Men', year: 1957 },
		{ id: '6', title: 'The Lord of the Rings: The Return of the King', year: 2003 },
		{ id: '7', title: "Schindler's List", year: 1993 },
		{ id: '8', title: 'Pulp Fiction', year: 1994 },
		{ id: '9', title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
		{ id: '10', title: 'The Good, the Bad and the Ugly', year: 1966 },
		{ id: '11', title: 'Forrest Gump', year: 1994 },
		{ id: '12', title: 'The Lord of the Rings: The Two Towers', year: 2002 },
		{ id: '13', title: 'Fight Club', year: 1999 },
		{ id: '14', title: 'Inception', year: 2010 },
		{ id: '15', title: 'Star Wars: Episode V – The Empire Strikes Back', year: 1980 },
		{ id: '16', title: 'The Matrix', year: 1999 },
		{ id: '17', title: 'Goodfellas', year: 1990 },
		{ id: '18', title: 'Interstellar', year: 2014 },
		{ id: '19', title: "One Flew Over the Cuckoo's Nest", year: 1975 },
		{ id: '20', title: 'Se7en', year: 1995 },
		{ id: '21', title: "It's a Wonderful Life", year: 1946 },
		{ id: '22', title: 'The Silence of the Lambs', year: 1991 },
		{ id: '23', title: 'Seven Samurai', year: 1954 },
		{ id: '24', title: 'Saving Private Ryan', year: 1998 },
		{ id: '25', title: 'City of God', year: 2002 },
		{ id: '26', title: 'Life Is Beautiful', year: 1997 },
		{ id: '27', title: 'The Green Mile', year: 1999 },
		{ id: '28', title: 'Star Wars: Episode IV – A New Hope', year: 1977 },
		{ id: '29', title: 'Terminator 2: Judgment Day', year: 1991 },
		{ id: '30', title: 'Back to the Future', year: 1985 },
		{ id: '31', title: 'Spirited Away', year: 2001 },
		{ id: '32', title: 'The Pianist', year: 2002 },
		{ id: '33', title: 'Psycho', year: 1960 },
		{ id: '34', title: 'Parasite', year: 2019 },
		{ id: '35', title: 'Gladiator', year: 2000 },
		{ id: '36', title: 'Léon: The Professional', year: 1994 },
		{ id: '37', title: 'American History X', year: 1998 },
		{ id: '38', title: 'The Departed', year: 2006 },
		{ id: '39', title: 'Whiplash', year: 2014 },
		{ id: '40', title: 'The Prestige', year: 2006 },
		{ id: '41', title: 'Grave of the Fireflies', year: 1988 },
		{ id: '42', title: 'The Usual Suspects', year: 1995 },
		{ id: '43', title: 'Casablanca', year: 1942 },
		{ id: '44', title: 'Harakiri', year: 1962 },
		{ id: '45', title: 'The Lion King', year: 1994 },
		{ id: '46', title: 'The Intouchables', year: 2011 },
		{ id: '47', title: 'Modern Times', year: 1936 },
		{ id: '48', title: 'The Lives of Others', year: 2006 },
		{ id: '49', title: 'Once Upon a Time in the West', year: 1968 },
		{ id: '50', title: 'Rear Window', year: 1954 },
		{ id: '51', title: 'Alien', year: 1979 },
		{ id: '52', title: 'City Lights', year: 1931 },
		{ id: '53', title: 'The Shining', year: 1980 },
		{ id: '54', title: 'Cinema Paradiso', year: 1988 },
		{ id: '55', title: 'Avengers: Infinity War', year: 2018 },
		{ id: '56', title: 'Paths of Glory', year: 1957 },
		{ id: '57', title: 'Django Unchained', year: 2012 },
		{ id: '58', title: 'WALL·E', year: 2008 },
		{ id: '59', title: 'Sunset Boulevard', year: 1950 },
		{ id: '60', title: 'The Great Dictator', year: 1940 },
		{ id: '61', title: 'The Dark Knight Rises', year: 2012 },
		{ id: '62', title: 'Princess Mononoke', year: 1997 },
		{ id: '63', title: 'Witness for the Prosecution', year: 1957 },
		{ id: '64', title: 'Oldboy', year: 2003 },
		{ id: '65', title: 'Aliens', year: 1986 },
		{ id: '66', title: 'Once Upon a Time in America', year: 1984 },
		{ id: '67', title: 'Coco', year: 2017 },
		{ id: '68', title: 'Your Name.', year: 2016 },
		{ id: '69', title: 'American Beauty', year: 1999 },
		{ id: '70', title: 'Braveheart', year: 1995 },
		{ id: '71', title: 'Das Boot', year: 1981 },
		{ id: '72', title: '3 Idiots', year: 2009 },
		{ id: '73', title: 'Toy Story', year: 1995 },
		{ id: '74', title: 'Inglourious Basterds', year: 2009 },
		{ id: '75', title: 'High and Low', year: 1963 },
		{ id: '76', title: 'Amadeus', year: 1984 },
		{ id: '77', title: 'Good Will Hunting', year: 1997 },
		{ id: '78', title: 'Star Wars: Episode VI – Return of the Jedi', year: 1983 },
		{ id: '79', title: 'The Hunt', year: 2012 },
		{ id: '80', title: 'Capharnaüm', year: 2018 },
		{ id: '81', title: 'Reservoir Dogs', year: 1992 },
		{ id: '82', title: 'Eternal Sunshine of the Spotless Mind', year: 2004 },
		{ id: '83', title: 'Requiem for a Dream', year: 2000 },
		{ id: '84', title: 'Come and See', year: 1985 },
		{ id: '85', title: 'Ikiru', year: 1952 },
		{ id: '86', title: 'Vertigo', year: 1958 },
		{ id: '87', title: 'Lawrence of Arabia', year: 1962 },
		{ id: '88', title: 'Citizen Kane', year: 1941 },
		{ id: '89', title: 'Memento', year: 2000 },
		{ id: '90', title: 'North by Northwest', year: 1959 },
		{ id: '91', title: 'Star Wars: Episode III – Revenge of the Sith', year: 2005 },
		{ id: '92', title: '2001: A Space Odyssey', year: 1968 },
		{ id: '93', title: 'Amélie', year: 2001 },
		{ id: '94', title: "Singin' in the Rain", year: 1952 },
		{ id: '95', title: 'Apocalypse Now', year: 1979 },
		{ id: '96', title: 'Taxi Driver', year: 1976 },
		{ id: '97', title: 'Downfall', year: 2004 },
		{ id: '98', title: 'The Wolf of Wall Street', year: 2013 },
		{ id: '99', title: 'A Clockwork Orange', year: 1971 },
		{ id: '100', title: 'Double Indemnity', year: 1944 }
	];

	let searchValue = $state('');
	let searchResults = $state<Movie[]>([]);
	let error = $state<string | null>(null);
	let isPending = $state(false);

	const { contains } = Autocomplete.useFilter();

	let abortController: AbortController | null = null;

	const status = $derived.by(() => {
		if (isPending) {
			return 'Searching…';
		}

		if (error) {
			return error;
		}

		if (searchValue === '') {
			return null;
		}

		if (searchResults.length === 0) {
			return `Movie or year "${searchValue}" does not exist in the Top 100 IMDb movies`;
		}

		return `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} found`;
	});

	async function searchMovies(
		query: string,
		filter: (item: string, query: string) => boolean
	): Promise<{ movies: Movie[]; error: string | null }> {
		// Simulate network delay
		await new Promise((resolve) => {
			setTimeout(resolve, Math.random() * 500 + 100);
		});

		// Simulate occasional network errors (1% chance)
		if (Math.random() < 0.01 || query === 'will_error') {
			return {
				movies: [],
				error: 'Failed to fetch movies. Please try again.'
			};
		}

		const movies = top100Movies.filter(
			(movie) => filter(movie.title, query) || filter(movie.year.toString(), query)
		);

		return {
			movies,
			error: null
		};
	}

	async function handleValueChange(nextSearchValue: string) {
		const controller = new AbortController();
		abortController?.abort();
		abortController = controller;

		if (nextSearchValue === '') {
			searchResults = [];
			error = null;
			isPending = false;
			return;
		}

		isPending = true;
		error = null;

		const result = await searchMovies(nextSearchValue, contains);
		if (controller.signal.aborted) {
			return;
		}

		searchResults = result.movies;
		error = result.error;
		isPending = false;
	}
</script>

<Autocomplete.Root
	items={searchResults}
	bind:value={searchValue}
	onValueChange={handleValueChange}
	itemToStringValue={(item) => item.title}
	filter={null}
>
	<label class="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
		Search movies by name or year
		<Autocomplete.Input
			placeholder="e.g. Pulp Fiction or 1994"
			class="h-8 w-[16rem] border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Autocomplete.Portal hidden={!status}>
		<Autocomplete.Positioner class="outline-hidden" sideOffset={4} align="start">
			<Autocomplete.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				aria-busy={isPending || undefined}
			>
				<div
					class="max-h-[min(var(--available-height),22.5rem)] overflow-y-auto overscroll-contain py-1 scroll-pt-1 scroll-pb-1"
				>
					<Autocomplete.Status>
						{#if status}
							<div
								class="flex items-center gap-2 py-1 pr-8 pl-2 text-sm text-neutral-500 dark:text-neutral-400"
							>
								{#if isPending}
									<span
										class="inline-block size-3 animate-spin rounded-full border border-current border-r-transparent rtl:border-r-current rtl:border-l-transparent"
										aria-hidden="true"
									></span>
								{/if}
								{status}
							</div>
						{/if}
					</Autocomplete.Status>
					<Autocomplete.List>
						<Autocomplete.Collection>
							{#snippet children(movie: Movie)}
								<Autocomplete.Item
									value={movie}
									class="group flex cursor-default py-2 pr-2 pl-2 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
								>
									<span class="flex w-full flex-col gap-1">
										<span class="font-bold leading-5">{movie.title}</span>
										<span
											class="text-sm leading-4 text-neutral-500 dark:text-neutral-400 group-data-highlighted:text-neutral-300 dark:group-data-highlighted:text-neutral-500"
										>
											{movie.year}
										</span>
									</span>
								</Autocomplete.Item>
							{/snippet}
						</Autocomplete.Collection>
					</Autocomplete.List>
				</div>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

### Inline autocomplete

Autofill the input with the highlighted item while navigating with arrow keys using the `mode` prop. Accepts `aria-autocomplete` values `list`, `both`, `inline`, or `none`.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	interface Tag {
		id: string;
		value: string;
	}

	const tags: Tag[] = [
		{ id: 't1', value: 'feature' },
		{ id: 't2', value: 'fix' },
		{ id: 't3', value: 'bug' },
		{ id: 't4', value: 'docs' },
		{ id: 't5', value: 'internal' },
		{ id: 't6', value: 'mobile' },
		{ id: 'c-accordion', value: 'component: accordion' },
		{ id: 'c-alert-dialog', value: 'component: alert dialog' },
		{ id: 'c-autocomplete', value: 'component: autocomplete' },
		{ id: 'c-avatar', value: 'component: avatar' },
		{ id: 'c-checkbox', value: 'component: checkbox' },
		{ id: 'c-checkbox-group', value: 'component: checkbox group' },
		{ id: 'c-collapsible', value: 'component: collapsible' },
		{ id: 'c-combobox', value: 'component: combobox' },
		{ id: 'c-context-menu', value: 'component: context menu' },
		{ id: 'c-dialog', value: 'component: dialog' },
		{ id: 'c-field', value: 'component: field' },
		{ id: 'c-fieldset', value: 'component: fieldset' },
		{ id: 'c-filterable-menu', value: 'component: filterable menu' },
		{ id: 'c-form', value: 'component: form' },
		{ id: 'c-input', value: 'component: input' },
		{ id: 'c-menu', value: 'component: menu' },
		{ id: 'c-menubar', value: 'component: menubar' },
		{ id: 'c-meter', value: 'component: meter' },
		{ id: 'c-navigation-menu', value: 'component: navigation menu' },
		{ id: 'c-number-field', value: 'component: number field' },
		{ id: 'c-popover', value: 'component: popover' },
		{ id: 'c-preview-card', value: 'component: preview card' },
		{ id: 'c-progress', value: 'component: progress' },
		{ id: 'c-radio', value: 'component: radio' },
		{ id: 'c-scroll-area', value: 'component: scroll area' },
		{ id: 'c-select', value: 'component: select' },
		{ id: 'c-separator', value: 'component: separator' },
		{ id: 'c-slider', value: 'component: slider' },
		{ id: 'c-switch', value: 'component: switch' },
		{ id: 'c-tabs', value: 'component: tabs' },
		{ id: 'c-toast', value: 'component: toast' },
		{ id: 'c-toggle', value: 'component: toggle' },
		{ id: 'c-toggle-group', value: 'component: toggle group' },
		{ id: 'c-toolbar', value: 'component: toolbar' },
		{ id: 'c-tooltip', value: 'component: tooltip' }
	];
</script>

<Autocomplete.Root items={tags} mode="both">
	<label class="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
		Search tags
		<Autocomplete.Input
			placeholder="e.g. feature"
			class="h-8 w-[16rem] border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class="outline-hidden data-empty:hidden" sideOffset={4}>
			<Autocomplete.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Autocomplete.List
					class="outline-0 overflow-y-auto scroll-py-[0.25rem] py-1 overscroll-contain max-h-[min(22.5rem,var(--available-height))] data-empty:p-0"
				>
					<Autocomplete.Collection>
						{#snippet children(tag: Tag)}
							<Autocomplete.Item
								value={tag}
								class="flex cursor-default items-center gap-2 py-2 pr-2 pl-2 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
							>
								{tag.value}
							</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

### Grouped

Organize related options with `<Autocomplete.Group>` and `<Autocomplete.GroupLabel>` to add section headings inside the popup.

Groups are represented by an array of objects with an `items` property, which itself is an array of individual items for each group. An extra property, such as `value`, can be provided for the heading text when rendering the group label.

```ts title="Example"
interface ProduceGroupItem {
	value: string;
	// @highlight
	items: string[];
}

const groups: ProduceGroupItem[] = [
	{
		value: 'Fruits',
		// @highlight
		items: ['Apple', 'Banana', 'Orange']
	},
	{
		value: 'Vegetables',
		// @highlight
		items: ['Carrot', 'Lettuce', 'Spinach']
	}
];
```

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	interface Tag {
		id: string;
		label: string;
		group: 'Type' | 'Component';
	}

	interface TagGroup {
		value: string;
		items: Tag[];
	}

	const tagsData: Tag[] = [
		{ id: 't1', label: 'feature', group: 'Type' },
		{ id: 't2', label: 'fix', group: 'Type' },
		{ id: 't3', label: 'bug', group: 'Type' },
		{ id: 't4', label: 'docs', group: 'Type' },
		{ id: 't5', label: 'internal', group: 'Type' },
		{ id: 't6', label: 'mobile', group: 'Type' },
		{ id: 'c-accordion', label: 'component: accordion', group: 'Component' },
		{ id: 'c-alert-dialog', label: 'component: alert dialog', group: 'Component' },
		{ id: 'c-autocomplete', label: 'component: autocomplete', group: 'Component' },
		{ id: 'c-avatar', label: 'component: avatar', group: 'Component' },
		{ id: 'c-checkbox', label: 'component: checkbox', group: 'Component' },
		{ id: 'c-checkbox-group', label: 'component: checkbox group', group: 'Component' },
		{ id: 'c-collapsible', label: 'component: collapsible', group: 'Component' },
		{ id: 'c-combobox', label: 'component: combobox', group: 'Component' },
		{ id: 'c-context-menu', label: 'component: context menu', group: 'Component' },
		{ id: 'c-dialog', label: 'component: dialog', group: 'Component' },
		{ id: 'c-field', label: 'component: field', group: 'Component' },
		{ id: 'c-fieldset', label: 'component: fieldset', group: 'Component' },
		{ id: 'c-filterable-menu', label: 'component: filterable menu', group: 'Component' },
		{ id: 'c-form', label: 'component: form', group: 'Component' },
		{ id: 'c-input', label: 'component: input', group: 'Component' },
		{ id: 'c-menu', label: 'component: menu', group: 'Component' },
		{ id: 'c-menubar', label: 'component: menubar', group: 'Component' },
		{ id: 'c-meter', label: 'component: meter', group: 'Component' },
		{ id: 'c-navigation-menu', label: 'component: navigation menu', group: 'Component' },
		{ id: 'c-number-field', label: 'component: number field', group: 'Component' },
		{ id: 'c-popover', label: 'component: popover', group: 'Component' },
		{ id: 'c-preview-card', label: 'component: preview card', group: 'Component' },
		{ id: 'c-progress', label: 'component: progress', group: 'Component' },
		{ id: 'c-radio', label: 'component: radio', group: 'Component' },
		{ id: 'c-scroll-area', label: 'component: scroll area', group: 'Component' },
		{ id: 'c-select', label: 'component: select', group: 'Component' },
		{ id: 'c-separator', label: 'component: separator', group: 'Component' },
		{ id: 'c-slider', label: 'component: slider', group: 'Component' },
		{ id: 'c-switch', label: 'component: switch', group: 'Component' },
		{ id: 'c-tabs', label: 'component: tabs', group: 'Component' },
		{ id: 'c-toast', label: 'component: toast', group: 'Component' },
		{ id: 'c-toggle', label: 'component: toggle', group: 'Component' },
		{ id: 'c-toggle-group', label: 'component: toggle group', group: 'Component' },
		{ id: 'c-toolbar', label: 'component: toolbar', group: 'Component' },
		{ id: 'c-tooltip', label: 'component: tooltip', group: 'Component' }
	];

	function groupTags(tags: Tag[]): TagGroup[] {
		const groups: { [key: string]: Tag[] } = {};
		tags.forEach((t) => {
			(groups[t.group] ??= []).push(t);
		});
		const order = ['Type', 'Component'];
		return order.map((value) => ({ value, items: groups[value] ?? [] }));
	}

	const groupedTags: TagGroup[] = groupTags(tagsData);
</script>

<Autocomplete.Root items={groupedTags}>
	<label class="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
		Select a tag
		<Autocomplete.Input
			placeholder="e.g. feature"
			class="h-8 w-[16rem] border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
			<Autocomplete.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Autocomplete.Empty>
					<div class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No tags found.
					</div>
				</Autocomplete.Empty>
				<Autocomplete.List
					class="outline-0 overflow-y-auto py-1 scroll-py-1 overscroll-contain max-h-[min(22.5rem,var(--available-height))] data-empty:p-0"
				>
					<Autocomplete.Collection>
						{#snippet children(group: TagGroup)}
							<Autocomplete.Group items={group.items} class="block pb-2 last:pb-0">
								<Autocomplete.GroupLabel
									class="p-2 text-sm leading-4 text-neutral-500 select-none dark:text-neutral-400"
								>
									{group.value}
								</Autocomplete.GroupLabel>
								<Autocomplete.Collection>
									{#snippet children(tag: Tag)}
										<Autocomplete.Item
											value={tag}
											class="flex cursor-default items-center gap-2 py-2 pr-2 pl-2 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
										>
											{tag.label}
										</Autocomplete.Item>
									{/snippet}
								</Autocomplete.Collection>
							</Autocomplete.Group>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

### Fuzzy matching

Use fuzzy matching to find relevant results even when the query doesn't exactly match the item text.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { matchSorter } from 'match-sorter';

	interface FuzzyItem {
		title: string;
		description: string;
		category: string;
	}

	const fuzzyItems: FuzzyItem[] = [
		{
			title: 'React Hooks Guide',
			description: 'Learn how to use React Hooks like useState, useEffect, and custom hooks',
			category: 'React'
		},
		{
			title: 'JavaScript Array Methods',
			description: 'Master array methods like map, filter, reduce, and forEach in JavaScript',
			category: 'JavaScript'
		},
		{
			title: 'CSS Flexbox Layout',
			description: 'Complete guide to CSS Flexbox for responsive web design',
			category: 'CSS'
		},
		{
			title: 'TypeScript Interfaces',
			description: 'Understanding TypeScript interfaces and type definitions',
			category: 'TypeScript'
		},
		{
			title: 'React Performance Optimization',
			description: 'Tips and techniques for optimizing React application performance',
			category: 'React'
		},
		{
			title: 'HTML Semantic Elements',
			description: 'Using semantic HTML elements for better accessibility and SEO',
			category: 'HTML'
		},
		{
			title: 'Node.js Express Server',
			description: 'Building RESTful APIs with Node.js and Express framework',
			category: 'Node.js'
		},
		{
			title: 'Vue Composition API',
			description: 'Modern Vue.js development using the Composition API',
			category: 'Vue.js'
		},
		{
			title: 'Angular Components',
			description: 'Creating reusable Angular components with TypeScript',
			category: 'Angular'
		},
		{
			title: 'Python Django Framework',
			description: 'Web development with Python Django framework',
			category: 'Python'
		},
		{
			title: 'CSS Grid Layout',
			description: 'Advanced CSS Grid techniques for complex layouts',
			category: 'CSS'
		},
		{
			title: 'React Testing Library',
			description: 'Testing React components with React Testing Library',
			category: 'React'
		},
		{
			title: 'MongoDB Queries',
			description: 'Advanced MongoDB queries and aggregation pipelines',
			category: 'Database'
		},
		{
			title: 'Webpack Configuration',
			description: 'Optimizing webpack configuration for production builds',
			category: 'Build Tools'
		},
		{
			title: 'SASS/SCSS Guide',
			description: 'Writing maintainable CSS with SASS and SCSS',
			category: 'CSS'
		}
	];

	function fuzzyFilter(item: FuzzyItem, query: string): boolean {
		if (!query) {
			return true;
		}

		const results = matchSorter([item], query, {
			keys: [
				'title',
				'description',
				'category',
				{ key: 'title', threshold: matchSorter.rankings.CONTAINS },
				{ key: 'description', threshold: matchSorter.rankings.WORD_STARTS_WITH }
			]
		});

		return results.length > 0;
	}

	function highlightText(text: string, query: string): { text: string; match: boolean }[] {
		const trimmed = query.trim();
		if (!trimmed) {
			return [{ text, match: false }];
		}

		const limited = trimmed.slice(0, 100);
		const escaped = limited.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(${escaped})`, 'gi');

		return text
			.split(regex)
			.map((part) => ({ text: part, match: part.toLowerCase() === limited.toLowerCase() }));
	}
</script>

<Autocomplete.Root items={fuzzyItems} filter={fuzzyFilter} itemToStringValue={(item) => item.title}>
	<label class="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
		Fuzzy search documentation
		<Autocomplete.Input
			placeholder="e.g. React"
			class="h-8 w-[16rem] border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
			<Autocomplete.Popup
				class="w-(--anchor-width) max-w-(--available-width) border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Autocomplete.Empty>
					<div class="py-3 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No results found for "<Autocomplete.Value />"
					</div>
				</Autocomplete.Empty>

				<Autocomplete.List
					class="flex max-h-[min(var(--available-height),28rem)] flex-col overflow-y-auto overscroll-contain py-1 scroll-pt-1 scroll-pb-1 empty:p-0"
				>
					<Autocomplete.Collection>
						{#snippet children(item: FuzzyItem)}
							<Autocomplete.Item
								value={item}
								class="flex cursor-default py-3 pr-2 pl-2 text-sm leading-6 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-100 dark:data-highlighted:before:bg-neutral-800"
							>
								<Autocomplete.Value>
									{#snippet children(value)}
										<span class="flex w-full flex-col gap-1">
											<span class="flex items-center justify-between gap-3">
												<span class="flex-1 font-bold leading-5">
													{@render highlighted(item.title, value)}
												</span>
											</span>
											<span class="text-sm text-neutral-500 dark:text-neutral-400">
												{@render highlighted(item.description, value)}
											</span>
										</span>
									{/snippet}
								</Autocomplete.Value>
							</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>

{#snippet highlighted(text: string, query: string)}
	{#each highlightText(text, query) as part, index (index)}
		{#if part.match}
			<mark class="bg-transparent font-bold text-blue-800 dark:text-blue-500">{part.text}</mark>
		{:else}
			{part.text}
		{/if}
	{/each}
{/snippet}
```

### Limit results

Limit the number of visible items using the `limit` prop and guide users to refine their query using `<Autocomplete.Status>`.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	const limit = 8;

	interface Tag {
		id: string;
		value: string;
	}

	const tags: Tag[] = [
		{ id: 't1', value: 'feature' },
		{ id: 't2', value: 'fix' },
		{ id: 't3', value: 'bug' },
		{ id: 't4', value: 'docs' },
		{ id: 't5', value: 'internal' },
		{ id: 't6', value: 'mobile' },
		{ id: 't7', value: 'frontend' },
		{ id: 't8', value: 'backend' },
		{ id: 't9', value: 'performance' },
		{ id: 't10', value: 'accessibility' },
		{ id: 't11', value: 'design' },
		{ id: 't12', value: 'research' },
		{ id: 't13', value: 'testing' },
		{ id: 't14', value: 'infrastructure' },
		{ id: 't15', value: 'documentation' },
		{ id: 'c-accordion', value: 'component: accordion' },
		{ id: 'c-alert-dialog', value: 'component: alert dialog' },
		{ id: 'c-autocomplete', value: 'component: autocomplete' },
		{ id: 'c-avatar', value: 'component: avatar' },
		{ id: 'c-checkbox', value: 'component: checkbox' },
		{ id: 'c-checkbox-group', value: 'component: checkbox group' },
		{ id: 'c-collapsible', value: 'component: collapsible' },
		{ id: 'c-combobox', value: 'component: combobox' },
		{ id: 'c-context-menu', value: 'component: context menu' },
		{ id: 'c-dialog', value: 'component: dialog' },
		{ id: 'c-field', value: 'component: field' },
		{ id: 'c-fieldset', value: 'component: fieldset' },
		{ id: 'c-filterable-menu', value: 'component: filterable menu' },
		{ id: 'c-form', value: 'component: form' },
		{ id: 'c-input', value: 'component: input' },
		{ id: 'c-menu', value: 'component: menu' },
		{ id: 'c-menubar', value: 'component: menubar' },
		{ id: 'c-meter', value: 'component: meter' },
		{ id: 'c-navigation-menu', value: 'component: navigation menu' },
		{ id: 'c-number-field', value: 'component: number field' },
		{ id: 'c-popover', value: 'component: popover' },
		{ id: 'c-preview-card', value: 'component: preview card' },
		{ id: 'c-progress', value: 'component: progress' },
		{ id: 'c-radio', value: 'component: radio' },
		{ id: 'c-scroll-area', value: 'component: scroll area' },
		{ id: 'c-select', value: 'component: select' },
		{ id: 'c-separator', value: 'component: separator' },
		{ id: 'c-slider', value: 'component: slider' },
		{ id: 'c-switch', value: 'component: switch' },
		{ id: 'c-tabs', value: 'component: tabs' },
		{ id: 'c-toast', value: 'component: toast' },
		{ id: 'c-toggle', value: 'component: toggle' },
		{ id: 'c-toggle-group', value: 'component: toggle group' },
		{ id: 'c-toolbar', value: 'component: toolbar' },
		{ id: 'c-tooltip', value: 'component: tooltip' }
	];

	let value = $state('');

	const { contains } = Autocomplete.useFilter({ sensitivity: 'base' });

	const totalMatches = $derived.by(() => {
		const trimmed = value.trim();
		if (!trimmed) {
			return tags.length;
		}
		return tags.filter((t) => contains(t.value, trimmed)).length;
	});

	const moreCount = $derived(Math.max(0, totalMatches - limit));
</script>

<Autocomplete.Root items={tags} bind:value {limit}>
	<label class="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
		Limit results to 8
		<Autocomplete.Input
			placeholder="e.g. component"
			class="h-8 w-[16rem] border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
			<Autocomplete.Popup
				class="w-[var(--anchor-width)] max-h-[min(var(--available-height),22.5rem)] max-w-[var(--available-width)] overflow-y-auto scroll-pt-1 scroll-pb-1 overscroll-contain border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Autocomplete.Empty>
					<div class="py-2 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No results found for "{value}"
					</div>
				</Autocomplete.Empty>

				<Autocomplete.List>
					<Autocomplete.Collection>
						{#snippet children(tag: Tag)}
							<Autocomplete.Item
								value={tag}
								class="flex cursor-default py-2 pr-2 pl-2 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
							>
								{tag.value}
							</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>

				<Autocomplete.Status>
					{#if moreCount > 0}
						<div class="py-2 pr-4 pl-2 text-sm text-neutral-500 dark:text-neutral-400">
							{`Hiding ${moreCount} results (type a more specific query to narrow results)`}
						</div>
					{/if}
				</Autocomplete.Status>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

### Auto highlight

The first matching item can be automatically highlighted as the user types by specifying the `autoHighlight` prop on `<Autocomplete.Root>`. Set the prop's value to `"always"` if the highlight should always be present, such as when the list is rendered inline within a dialog.

The prop can be combined with the `keepHighlight` and `highlightItemOnHover` props to configure how the highlight behaves during mouse interactions.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	interface Tag {
		id: string;
		value: string;
	}

	const tags: Tag[] = [
		{ id: 't1', value: 'feature' },
		{ id: 't2', value: 'fix' },
		{ id: 't3', value: 'bug' },
		{ id: 't4', value: 'docs' },
		{ id: 't5', value: 'internal' },
		{ id: 't6', value: 'mobile' },
		{ id: 'c-accordion', value: 'component: accordion' },
		{ id: 'c-alert-dialog', value: 'component: alert dialog' },
		{ id: 'c-autocomplete', value: 'component: autocomplete' },
		{ id: 'c-avatar', value: 'component: avatar' },
		{ id: 'c-checkbox', value: 'component: checkbox' },
		{ id: 'c-checkbox-group', value: 'component: checkbox group' },
		{ id: 'c-collapsible', value: 'component: collapsible' },
		{ id: 'c-combobox', value: 'component: combobox' },
		{ id: 'c-context-menu', value: 'component: context menu' },
		{ id: 'c-dialog', value: 'component: dialog' },
		{ id: 'c-field', value: 'component: field' },
		{ id: 'c-fieldset', value: 'component: fieldset' },
		{ id: 'c-filterable-menu', value: 'component: filterable menu' },
		{ id: 'c-form', value: 'component: form' },
		{ id: 'c-input', value: 'component: input' },
		{ id: 'c-menu', value: 'component: menu' },
		{ id: 'c-menubar', value: 'component: menubar' },
		{ id: 'c-meter', value: 'component: meter' },
		{ id: 'c-navigation-menu', value: 'component: navigation menu' },
		{ id: 'c-number-field', value: 'component: number field' },
		{ id: 'c-popover', value: 'component: popover' },
		{ id: 'c-preview-card', value: 'component: preview card' },
		{ id: 'c-progress', value: 'component: progress' },
		{ id: 'c-radio', value: 'component: radio' },
		{ id: 'c-scroll-area', value: 'component: scroll area' },
		{ id: 'c-select', value: 'component: select' },
		{ id: 'c-separator', value: 'component: separator' },
		{ id: 'c-slider', value: 'component: slider' },
		{ id: 'c-switch', value: 'component: switch' },
		{ id: 'c-tabs', value: 'component: tabs' },
		{ id: 'c-toast', value: 'component: toast' },
		{ id: 'c-toggle', value: 'component: toggle' },
		{ id: 'c-toggle-group', value: 'component: toggle group' },
		{ id: 'c-toolbar', value: 'component: toolbar' },
		{ id: 'c-tooltip', value: 'component: tooltip' }
	];
</script>

<Autocomplete.Root items={tags} autoHighlight>
	<label class="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
		Auto highlight on type
		<Autocomplete.Input
			placeholder="e.g. feature"
			class="h-8 w-[16rem] border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
			<Autocomplete.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Autocomplete.Empty>
					<div class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No tags found.
					</div>
				</Autocomplete.Empty>
				<Autocomplete.List
					class="outline-0 overflow-y-auto scroll-py-[0.25rem] py-1 overscroll-contain max-h-[min(22.5rem,var(--available-height))] data-empty:p-0"
				>
					<Autocomplete.Collection>
						{#snippet children(tag: Tag)}
							<Autocomplete.Item
								value={tag}
								class="flex cursor-default items-center gap-2 py-2 pr-2 pl-2 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
							>
								{tag.value}
							</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

### Command palette

Use the autocomplete input to filter a list of command items that perform an action when clicked.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { Dialog } from '@sveltery/base/dialog';
	import { ScrollArea } from '@sveltery/base/scroll-area';

	interface Item {
		value: string;
		label: string;
	}

	interface Group {
		value: string;
		items: Item[];
	}

	const suggestions: Item[] = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'figma', label: 'Figma' },
		{ value: 'slack', label: 'Slack' },
		{ value: 'youtube', label: 'YouTube' },
		{ value: 'raycast', label: 'Raycast' },
		{ value: 'notion', label: 'Notion' },
		{ value: 'github', label: 'GitHub' },
		{ value: 'jira', label: 'Jira' },
		{ value: 'calendar', label: 'Google Calendar' },
		{ value: 'chrome', label: 'Google Chrome' },
		{ value: 'mail', label: 'Apple Mail' },
		{ value: 'terminal', label: 'Terminal' }
	];

	const commands: Item[] = [
		{ value: 'clipboard-history', label: 'Clipboard History' },
		{ value: 'import-extension', label: 'Import Extension' },
		{ value: 'create-snippet', label: 'Create Snippet' },
		{ value: 'system-preferences', label: 'System Preferences' },
		{ value: 'window-management', label: 'Window Management' },
		{ value: 'toggle-dark-mode', label: 'Toggle Dark Mode' },
		{ value: 'new-window', label: 'New Window' },
		{ value: 'new-tab', label: 'New Tab' },
		{ value: 'search-docs', label: 'Search Documentation' },
		{ value: 'capture-screen', label: 'Capture Screenshot' },
		{ value: 'close-sidebar', label: 'Toggle Sidebar' },
		{ value: 'toggle-terminal', label: 'Toggle Integrated Terminal' },
		{ value: 'run-script', label: 'Run Script' }
	];

	const groupedItems: Group[] = [
		{ value: 'Suggestions', items: suggestions },
		{ value: 'Commands', items: commands }
	];

	let open = $state(false);
	const shortcutsDescriptionId = $props.id();

	function handleItemClick() {
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="flex h-8 cursor-default items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700"
	>
		Open command palette
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 bg-black opacity-20 transition-opacity duration-150 ease-[cubic-bezier(0.45,1.005,0,1.005)] data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Viewport
			class="fixed inset-0 flex items-start justify-center overflow-hidden px-2 pt-18 pb-2"
		>
			<Dialog.Popup
				class="relative flex max-h-[min(36rem,calc(100dvh-5rem))] w-[calc(100vw-1rem)] max-w-md flex-col border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[translate,scale,opacity] duration-150 data-ending-style:-translate-y-4 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:-translate-y-4 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				aria-label="Command palette"
			>
				<Autocomplete.Root open inline items={groupedItems} autoHighlight="always" keepHighlight>
					<Autocomplete.InputGroup
						class="relative z-1 flex cursor-text items-center gap-2 bg-white pl-3 focus-within:outline-2 focus-within:outline-solid focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:bg-neutral-950 dark:focus-within:outline-white"
					>
						<svg
							class="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400"
							aria-hidden="true"
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-linecap="square"
							stroke-linejoin="round"
							style="display: block"
						>
							<path d="m11 11 3.5 3.5" />
							<circle cx="7" cy="7" r="5.5" />
						</svg>
						<Autocomplete.Input
							class="h-10 w-full border-0 bg-transparent pr-3 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:text-white dark:placeholder:text-neutral-400"
							aria-label="Search commands"
							aria-describedby={shortcutsDescriptionId}
							placeholder="Search for apps and commands…"
						/>
					</Autocomplete.InputGroup>
					<Dialog.Close class="sr-only">Close command palette</Dialog.Close>

					<ScrollArea.Root
						class="relative flex max-h-[min(60dvh,24rem)] min-h-0 flex-[0_1_auto] overflow-hidden border-t border-neutral-950 dark:border-t-white"
					>
						<ScrollArea.Viewport
							class="min-h-0 flex-1 overscroll-contain [scroll-padding-block:0.25rem] focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
						>
							<ScrollArea.Content style="min-width: 100%">
								<Autocomplete.Empty>
									<div
										class="flex min-h-32 items-center justify-start py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400"
									>
										No results found.
									</div>
								</Autocomplete.Empty>

								<Autocomplete.List class="py-1">
									<Autocomplete.Collection>
										{#snippet children(group: Group)}
											<Autocomplete.Group items={group.items} class="not-last:mb-1">
												<Autocomplete.GroupLabel
													class="flex min-h-8 items-center pr-6 pl-3 text-sm leading-none font-normal text-neutral-500 select-none outline-none dark:text-neutral-400"
												>
													{group.value}
												</Autocomplete.GroupLabel>
												<Autocomplete.Collection>
													{#snippet children(item: Item)}
														<Autocomplete.Item
															value={item}
															onclick={handleItemClick}
															class="group grid min-h-8 cursor-default grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-6 text-sm font-normal leading-[1.25] outline-none select-none [scroll-margin-block:0.25rem] data-highlighted:bg-neutral-200 dark:data-highlighted:bg-neutral-700"
														>
															<span class="min-w-0 truncate font-normal">{item.label}</span>
															<span
																class="shrink-0 whitespace-nowrap text-sm text-neutral-500 group-data-highlighted:text-neutral-700 dark:text-neutral-400 dark:group-data-highlighted:text-neutral-300"
															>
																{group.value === 'Suggestions' ? 'Application' : 'Command'}
															</span>
														</Autocomplete.Item>
													{/snippet}
												</Autocomplete.Collection>
											</Autocomplete.Group>
										{/snippet}
									</Autocomplete.Collection>
								</Autocomplete.List>
							</ScrollArea.Content>
						</ScrollArea.Viewport>
						<ScrollArea.Scrollbar class="flex w-4 justify-center bg-black/12 dark:bg-white/12">
							<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>

					<div
						class="flex items-center justify-between border-t border-neutral-950 bg-white px-3 py-2.5 text-xs text-neutral-600 dark:border-white dark:bg-neutral-950 dark:text-neutral-400"
					>
						<span id={shortcutsDescriptionId} class="sr-only">
							Use Enter to activate the highlighted item.
						</span>
						<div class="flex items-center gap-1">
							<span>Activate</span>
							<kbd
								class="inline-flex h-5 min-w-5 items-center justify-center border border-neutral-400 bg-neutral-100 px-1 font-mono text-[0.625rem] leading-none font-normal text-neutral-600 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
							>
								Enter
							</kbd>
						</div>
					</div>
				</Autocomplete.Root>
			</Dialog.Popup>
		</Dialog.Viewport>
	</Dialog.Portal>
</Dialog.Root>
```

### Grid layout

Display items in a grid layout, wrapping each row in `<Autocomplete.Row>` components.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	const COLUMNS = 5;

	function chunkArray<T>(array: T[], size: number): T[][] {
		const result: T[][] = [];
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
		return result;
	}

	interface EmojiItem {
		emoji: string;
		value: string;
		name: string;
	}

	interface EmojiGroup {
		value: string;
		label: string;
		items: EmojiItem[];
	}

	const emojiCategories = [
		{
			label: 'Smileys & Emotion',
			emojis: [
				{ emoji: '😀', name: 'grinning face' },
				{ emoji: '😃', name: 'grinning face with big eyes' },
				{ emoji: '😄', name: 'grinning face with smiling eyes' },
				{ emoji: '😁', name: 'beaming face with smiling eyes' },
				{ emoji: '😆', name: 'grinning squinting face' },
				{ emoji: '😅', name: 'grinning face with sweat' },
				{ emoji: '🤣', name: 'rolling on the floor laughing' },
				{ emoji: '😂', name: 'face with tears of joy' },
				{ emoji: '🙂', name: 'slightly smiling face' },
				{ emoji: '🙃', name: 'upside-down face' },
				{ emoji: '😉', name: 'winking face' },
				{ emoji: '😊', name: 'smiling face with smiling eyes' },
				{ emoji: '😇', name: 'smiling face with halo' },
				{ emoji: '🥰', name: 'smiling face with hearts' },
				{ emoji: '😍', name: 'smiling face with heart-eyes' },
				{ emoji: '🤩', name: 'star-struck' },
				{ emoji: '😘', name: 'face blowing a kiss' },
				{ emoji: '😗', name: 'kissing face' },
				{ emoji: '☺️', name: 'smiling face' },
				{ emoji: '😚', name: 'kissing face with closed eyes' },
				{ emoji: '😙', name: 'kissing face with smiling eyes' },
				{ emoji: '🥲', name: 'smiling face with tear' },
				{ emoji: '😋', name: 'face savoring food' },
				{ emoji: '😛', name: 'face with tongue' },
				{ emoji: '😜', name: 'winking face with tongue' },
				{ emoji: '🤪', name: 'zany face' },
				{ emoji: '😝', name: 'squinting face with tongue' },
				{ emoji: '🤑', name: 'money-mouth face' },
				{ emoji: '🤗', name: 'hugging face' },
				{ emoji: '🤭', name: 'face with hand over mouth' }
			]
		},
		{
			label: 'Animals & Nature',
			emojis: [
				{ emoji: '🐶', name: 'dog face' },
				{ emoji: '🐱', name: 'cat face' },
				{ emoji: '🐭', name: 'mouse face' },
				{ emoji: '🐹', name: 'hamster' },
				{ emoji: '🐰', name: 'rabbit face' },
				{ emoji: '🦊', name: 'fox' },
				{ emoji: '🐻', name: 'bear' },
				{ emoji: '🐼', name: 'panda' },
				{ emoji: '🐨', name: 'koala' },
				{ emoji: '🐯', name: 'tiger face' },
				{ emoji: '🦁', name: 'lion' },
				{ emoji: '🐮', name: 'cow face' },
				{ emoji: '🐷', name: 'pig face' },
				{ emoji: '🐽', name: 'pig nose' },
				{ emoji: '🐸', name: 'frog' },
				{ emoji: '🐵', name: 'monkey face' },
				{ emoji: '🙈', name: 'see-no-evil monkey' },
				{ emoji: '🙉', name: 'hear-no-evil monkey' },
				{ emoji: '🙊', name: 'speak-no-evil monkey' },
				{ emoji: '🐒', name: 'monkey' },
				{ emoji: '🐔', name: 'chicken' },
				{ emoji: '🐧', name: 'penguin' },
				{ emoji: '🐦', name: 'bird' },
				{ emoji: '🐤', name: 'baby chick' },
				{ emoji: '🐣', name: 'hatching chick' },
				{ emoji: '🐥', name: 'front-facing baby chick' },
				{ emoji: '🦆', name: 'duck' },
				{ emoji: '🦅', name: 'eagle' },
				{ emoji: '🦉', name: 'owl' },
				{ emoji: '🦇', name: 'bat' }
			]
		},
		{
			label: 'Food & Drink',
			emojis: [
				{ emoji: '🍎', name: 'red apple' },
				{ emoji: '🍏', name: 'green apple' },
				{ emoji: '🍊', name: 'tangerine' },
				{ emoji: '🍋', name: 'lemon' },
				{ emoji: '🍌', name: 'banana' },
				{ emoji: '🍉', name: 'watermelon' },
				{ emoji: '🍇', name: 'grapes' },
				{ emoji: '🍓', name: 'strawberry' },
				{ emoji: '🫐', name: 'blueberries' },
				{ emoji: '🍈', name: 'melon' },
				{ emoji: '🍒', name: 'cherries' },
				{ emoji: '🍑', name: 'peach' },
				{ emoji: '🥭', name: 'mango' },
				{ emoji: '🍍', name: 'pineapple' },
				{ emoji: '🥥', name: 'coconut' },
				{ emoji: '🥝', name: 'kiwi fruit' },
				{ emoji: '🍅', name: 'tomato' },
				{ emoji: '🍆', name: 'eggplant' },
				{ emoji: '🥑', name: 'avocado' },
				{ emoji: '🥦', name: 'broccoli' },
				{ emoji: '🥬', name: 'leafy greens' },
				{ emoji: '🥒', name: 'cucumber' },
				{ emoji: '🌶️', name: 'hot pepper' },
				{ emoji: '🫑', name: 'bell pepper' },
				{ emoji: '🌽', name: 'ear of corn' },
				{ emoji: '🥕', name: 'carrot' },
				{ emoji: '🫒', name: 'olive' },
				{ emoji: '🧄', name: 'garlic' },
				{ emoji: '🧅', name: 'onion' },
				{ emoji: '🥔', name: 'potato' }
			]
		}
	];
	const emojiGroups: EmojiGroup[] = emojiCategories.map((category) => ({
		value: category.label,
		label: category.label,
		items: category.emojis.map((emoji) => ({
			...emoji,
			value: emoji.name.toLowerCase()
		}))
	}));

	let pickerOpen = $state(false);
	let textValue = $state('');
	let searchValue = $state('');

	let textInput: HTMLInputElement | null = null;

	function handleInsertEmoji(value: string | null) {
		if (!value || !textInput) {
			return;
		}

		const emoji = value;
		const start = textInput.selectionStart ?? textInput.value.length ?? 0;
		const end = textInput.selectionEnd ?? textInput.value.length ?? 0;

		textValue = textValue.slice(0, start) + emoji + textValue.slice(end);
		pickerOpen = false;

		const input = textInput;
		if (input) {
			input.focus();
			const caretPos = start + emoji.length;
			queueMicrotask(() => input.setSelectionRange(caretPos, caretPos));
		}
	}
</script>

<div class="mx-auto w-[16rem]">
	<div class="relative flex w-full">
		<input
			bind:this={textInput}
			type="text"
			aria-label="Message"
			class="-mr-px h-8 flex-1 border border-r-0 border-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 bg-white dark:bg-neutral-950 focus:relative focus:outline-2 focus:-outline-offset-1 focus:outline-solid focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
			placeholder="iMessage"
			bind:value={textValue}
		/>

		<Autocomplete.Root
			items={emojiGroups}
			grid
			bind:open={pickerOpen}
			onOpenChangeComplete={() => (searchValue = '')}
			bind:value={searchValue}
			onValueChange={(value, details) => {
				if (details.reason === 'item-press') {
					details.cancel();
				}
			}}
		>
			<Autocomplete.Trigger
				class="flex size-8 items-center justify-center border border-neutral-950 bg-transparent text-xl leading-none text-neutral-950 outline-none hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-pressed:bg-neutral-100 dark:border-white dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-pressed:bg-neutral-800"
				aria-label="Choose emoji"
			>
				😀
			</Autocomplete.Trigger>
			<Autocomplete.Portal>
				<Autocomplete.Positioner class="outline-0" sideOffset={4} align="end">
					<Autocomplete.Popup
						class="[--input-container-height:2rem] max-h-[20.5rem] max-w-[var(--available-width)] origin-[var(--transform-origin)] bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 dark:bg-neutral-950 dark:text-white dark:shadow-none"
						aria-label="Select emoji"
					>
						<Autocomplete.Input
							aria-label="Search emojis"
							placeholder="Search emojis…"
							class="h-8 w-64 max-w-full border border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-solid focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:bg-neutral-950 dark:text-white"
						/>
						<div class="border border-t-0 border-neutral-950 dark:border-white">
							<Autocomplete.Empty>
								<div class="px-2 py-3 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
									No emojis found
								</div>
							</Autocomplete.Empty>
							<Autocomplete.List
								aria-label="Emoji results"
								class="max-h-[min(calc(20.5rem-var(--input-container-height)-2px),calc(var(--available-height)-var(--input-container-height)-2px))] overflow-auto scroll-pt-1 scroll-pb-[0.35rem] overscroll-contain py-2 empty:p-0"
							>
								<Autocomplete.Collection>
									{#snippet children(group: EmojiGroup)}
										<Autocomplete.Group items={group.items} class="block">
											<Autocomplete.GroupLabel
												class="p-2 text-sm leading-4 text-neutral-500 select-none dark:text-neutral-400"
											>
												{group.label}
											</Autocomplete.GroupLabel>
											<div class="px-2 pb-1 pt-0" role="presentation">
												{#each chunkArray(group.items, COLUMNS) as row, rowIdx (rowIdx)}
													<Autocomplete.Row class="grid grid-cols-5">
														{#each row as rowItem (rowItem.emoji)}
															<Autocomplete.Item
																value={rowItem}
																class="group flex h-10 min-w-[var(--anchor-width)] cursor-default flex-col items-center justify-center bg-transparent px-0.5 py-2 text-neutral-950 outline-0 select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-100 dark:text-white dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-neutral-800"
																onclick={() => {
																	handleInsertEmoji(rowItem.emoji);
																	pickerOpen = false;
																}}
															>
																<span class="text-2xl leading-none">{rowItem.emoji}</span>
															</Autocomplete.Item>
														{/each}
													</Autocomplete.Row>
												{/each}
											</div>
										</Autocomplete.Group>
									{/snippet}
								</Autocomplete.Collection>
							</Autocomplete.List>
						</div>
					</Autocomplete.Popup>
				</Autocomplete.Positioner>
			</Autocomplete.Portal>
		</Autocomplete.Root>
	</div>
</div>
```

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/svelte-virtual`.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { get } from 'svelte/store';

	interface VirtualizedItem {
		id: string;
		name: string;
	}

	const virtualizedItems: VirtualizedItem[] = Array.from({ length: 10000 }, (_, index) => {
		const id = String(index + 1);
		const indexLabel = id.padStart(4, '0');
		return { id, name: `Item ${indexLabel}` };
	});

	function getItemLabel(item: VirtualizedItem | null) {
		return item ? item.name : '';
	}

	let scrollElement = $state<HTMLDivElement | null>(null);

	const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
		count: virtualizedItems.length,
		getScrollElement: () => scrollElement,
		estimateSize: () => 32,
		overscan: 20,
		paddingStart: 4,
		paddingEnd: 4,
		scrollPaddingStart: 4,
		scrollPaddingEnd: 4
	});
</script>

<Autocomplete.Root
	virtualized
	items={virtualizedItems}
	openOnInputClick
	itemToStringValue={getItemLabel}
	onItemHighlighted={(item, { reason, index }) => {
		if (!item) {
			return;
		}

		const isStart = index === 0;
		const isEnd = index === $virtualizer.options.count - 1;
		const shouldScroll = reason === 'none' || (reason === 'keyboard' && (isStart || isEnd));

		if (shouldScroll) {
			queueMicrotask(() => {
				$virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' });
			});
		}
	}}
>
	<label class="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
		Search 10,000 items
		<Autocomplete.Input
			class="h-8 w-[16rem] border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
			<Autocomplete.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Autocomplete.Empty>
					<div class="py-3 px-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No items found.
					</div>
				</Autocomplete.Empty>
				<Autocomplete.List class="p-0">
					{@const filteredItems = Autocomplete.useFilteredItems<VirtualizedItem>().current}
					{#if filteredItems.length}
						{@const totalSize = $virtualizer.getTotalSize()}
						<div
							role="presentation"
							{@attach (element) => {
								scrollElement = element;
								get(virtualizer).setOptions({
									count: filteredItems.length
								});
								get(virtualizer).measure();
							}}
							class="h-[min(22.5rem,var(--total-size))] max-h-[var(--available-height)] overflow-auto overscroll-contain scroll-py-1"
							style="--total-size: {totalSize}px"
						>
							<div role="presentation" class="relative w-full" style="height: {totalSize}px">
								{#each $virtualizer.getVirtualItems() as virtualItem (virtualItem.key)}
									{@const item = filteredItems[virtualItem.index]}
									{#if item}
										<Autocomplete.Item
											index={virtualItem.index}
											data-index={virtualItem.index}
											{@attach $virtualizer.measureElement}
											value={item}
											class="flex cursor-default py-2 pr-2 pl-2 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
											aria-setsize={filteredItems.length}
											aria-posinset={virtualItem.index + 1}
											style="position: absolute; top: 0; left: 0; width: 100%; height: {virtualItem.size}px; transform: translateY({virtualItem.start}px)"
										>
											{item.name}
										</Autocomplete.Item>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

#### Memoizing items

Memoizing each item is a React technique for datasets up to roughly 1,000 items, and Svelte needs no equivalent. `<Autocomplete.Collection>` keeps the item for each unchanged value, so unchanged items skip re-rendering while the user types. While this speeds up typing, it does not speed up opening; with a large enough number of items, the mount cost dominates, and virtualization becomes necessary to keep the open interaction fast on low-end devices.

```svelte title="Memoizing list items"
<script lang="ts">
	interface Suggestion {
		id: string;
		label: string;
		description: string;
	}
</script>

<Autocomplete.List>
	<Autocomplete.Collection>
		{#snippet children(item: Suggestion)}
			<Autocomplete.Item value={item}>
				<span>{item.label}</span>
				<span>{item.description}</span>
			</Autocomplete.Item>
		{/snippet}
	</Autocomplete.Collection>
</Autocomplete.List>
```

## API reference

### Root

<ApiPart name="autocomplete" part="Root" />

### Value

<ApiPart name="autocomplete" part="Value" />

### Input

<ApiPart name="autocomplete" part="Input" />

| Attribute         | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `data-popup-open` | Present when the corresponding popup is open.                                      |
| `data-popup-side` | Indicates which side the corresponding popup is positioned relative to its anchor. |
| `data-list-empty` | Present when the corresponding items list is empty.                                |
| `data-pressed`    | Present when the input is pressed.                                                 |
| `data-disabled`   | Present when the component is disabled.                                            |
| `data-readonly`   | Present when the component is readonly.                                            |
| `data-required`   | Present when the component is required.                                            |
| `data-valid`      | Present when the component is in a valid state (when wrapped in Field.Root).       |
| `data-invalid`    | Present when the component is in an invalid state (when wrapped in Field.Root).    |
| `data-dirty`      | Present when the component's value has changed (when wrapped in Field.Root).       |
| `data-touched`    | Present when the component has been touched (when wrapped in Field.Root).          |
| `data-filled`     | Present when the component has a value (when wrapped in Field.Root).               |
| `data-focused`    | Present when the input is focused (when wrapped in Field.Root).                    |

### InputGroup

<ApiPart name="autocomplete" part="InputGroup" />

| Attribute         | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `data-popup-open` | Present when the corresponding popup is open.                                      |
| `data-popup-side` | Indicates which side the corresponding popup is positioned relative to its anchor. |
| `data-list-empty` | Present when the corresponding items list is empty.                                |
| `data-pressed`    | Present when the input group is pressed.                                           |
| `data-disabled`   | Present when the component is disabled.                                            |
| `data-readonly`   | Present when the component is readonly.                                            |
| `data-valid`      | Present when the component is in a valid state (when wrapped in Field.Root).       |
| `data-invalid`    | Present when the component is in an invalid state (when wrapped in Field.Root).    |
| `data-dirty`      | Present when the component's value has changed (when wrapped in Field.Root).       |
| `data-touched`    | Present when the component has been touched (when wrapped in Field.Root).          |
| `data-filled`     | Present when the component has a value (when wrapped in Field.Root).               |
| `data-focused`    | Present when the component is focused (when wrapped in Field.Root).                |

### Trigger

<ApiPart name="autocomplete" part="Trigger" />

| Attribute         | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `data-popup-open` | Present when the corresponding popup is open.                                      |
| `data-popup-side` | Indicates which side the corresponding popup is positioned relative to its anchor. |
| `data-list-empty` | Present when the corresponding items list is empty.                                |
| `data-pressed`    | Present when the trigger is pressed.                                               |
| `data-disabled`   | Present when the component is disabled.                                            |
| `data-readonly`   | Present when the component is readonly.                                            |
| `data-required`   | Present when the component is required.                                            |
| `data-valid`      | Present when the component is in a valid state (when wrapped in Field.Root).       |
| `data-invalid`    | Present when the component is in an invalid state (when wrapped in Field.Root).    |
| `data-dirty`      | Present when the component's value has changed (when wrapped in Field.Root).       |
| `data-touched`    | Present when the component has been touched (when wrapped in Field.Root).          |
| `data-filled`     | Present when the component has a value (when wrapped in Field.Root).               |
| `data-focused`    | Present when the trigger is focused (when wrapped in Field.Root).                  |

### Icon

<ApiPart name="autocomplete" part="Icon" />

### Clear

<ApiPart name="autocomplete" part="Clear" />

| Attribute             | Description                                   |
| --------------------- | --------------------------------------------- |
| `data-popup-open`     | Present when the corresponding popup is open. |
| `data-disabled`       | Present when the button is disabled.          |
| `data-visible`        | Present when the clear button is visible.     |
| `data-starting-style` | Present when the button begins animating in.  |
| `data-ending-style`   | Present when the button is animating out.     |

### List

<ApiPart name="autocomplete" part="List" />

### Portal

<ApiPart name="autocomplete" part="Portal" />

### Backdrop

<ApiPart name="autocomplete" part="Backdrop" />

| Attribute             | Description                                 |
| --------------------- | ------------------------------------------- |
| `data-open`           | Present when the popup is open.             |
| `data-closed`         | Present when the popup is closed.           |
| `data-starting-style` | Present when the popup begins animating in. |
| `data-ending-style`   | Present when the popup is animating out.    |

### Positioner

<ApiPart name="autocomplete" part="Positioner" />

| Attribute            | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `data-open`          | Present when the popup is open.                                       |
| `data-closed`        | Present when the popup is closed.                                     |
| `data-anchor-hidden` | Present when the anchor is hidden.                                    |
| `data-align`         | Indicates how the popup is aligned relative to specified side.        |
| `data-empty`         | Present when the items list is empty.                                 |
| `data-side`          | Indicates which side the popup is positioned relative to the trigger. |

| CSS variable         | Description                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| `--anchor-height`    | The anchor's height.                                                                   |
| `--anchor-width`     | The anchor's width.                                                                    |
| `--available-height` | The available height between the trigger and the edge of the viewport.                 |
| `--available-width`  | The available width between the trigger and the edge of the viewport.                  |
| `--transform-origin` | The coordinates that this element is anchored to. Used for animations and transitions. |

### Popup

<ApiPart name="autocomplete" part="Popup" />

| Attribute             | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| `data-open`           | Present when the popup is open.                                       |
| `data-closed`         | Present when the popup is closed.                                     |
| `data-anchor-hidden`  | Present when the anchor is hidden.                                    |
| `data-align`          | Indicates how the popup is aligned relative to specified side.        |
| `data-empty`          | Present when the items list is empty.                                 |
| `data-side`           | Indicates which side the popup is positioned relative to the trigger. |
| `data-starting-style` | Present when the popup begins animating in.                           |
| `data-ending-style`   | Present when the popup is animating out.                              |

### Arrow

<ApiPart name="autocomplete" part="Arrow" />

| Attribute         | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `data-open`       | Present when the popup is open.                                       |
| `data-closed`     | Present when the popup is closed.                                     |
| `data-uncentered` | Present when the arrow is uncentered.                                 |
| `data-align`      | Indicates how the popup is aligned relative to specified side.        |
| `data-side`       | Indicates which side the popup is positioned relative to the trigger. |

### Status

<ApiPart name="autocomplete" part="Status" />

### Empty

<ApiPart name="autocomplete" part="Empty" />

### Collection

<ApiPart name="autocomplete" part="Collection" />

### Row

<ApiPart name="autocomplete" part="Row" />

### Item

<ApiPart name="autocomplete" part="Item" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-highlighted` | Present when the item is highlighted. |
| `data-disabled`    | Present when the item is disabled.    |

### Group

<ApiPart name="autocomplete" part="Group" />

### GroupLabel

<ApiPart name="autocomplete" part="GroupLabel" />

### Separator

<ApiPart name="autocomplete" part="Separator" />

| Attribute          | Description                                 |
| ------------------ | ------------------------------------------- |
| `data-orientation` | Indicates the orientation of the separator. |

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching.
This function is used when externally filtering items.
`Autocomplete.useFilter` is a plain function, so call it in a `$derived` when its options change.

**Parameters**

| Parameter  | Type                        | Default | Description                 |
| ---------- | --------------------------- | ------- | --------------------------- |
| `options?` | `AutocompleteFilterOptions` | `{}`    | Options for the comparison. |

`AutocompleteFilterOptions`

| Prop       | Type                   | Description                                                                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `locale`   | `Intl.LocalesArgument` | The locale to use for string comparison. Defaults to the user's runtime locale. Any `Intl.CollatorOptions` are accepted too. |
| `multiple` | `boolean`              | Whether several values are selected. Defaults to `false`.                                                                    |
| `value`    | `unknown`              | The selected value. In single mode, `contains` matches every item while the query equals this value's label.                 |

**Return value**

`AutocompleteFilter`

| Property     | Type                                                                                  | Description                                          |
| ------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `contains`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item matches the query anywhere. |
| `startsWith` | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item starts with the query.      |
| `endsWith`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item ends with the query.        |

```svelte
<script lang="ts">
	const { contains } = Autocomplete.useFilter({ locale: 'de' });
</script>

<Autocomplete.Root items={countries} filter={contains} />
```

## useFilteredItems

Returns the internally filtered items when called inside `<Autocomplete.Root>`.
Treat the result as read-only: it is internal state and may be a shared frozen array.
Call it while a component inside the root initializes.

**Return value**

`{ readonly current: readonly Item[] }`

| Property  | Type              | Modifiers | Description                                          |
| --------- | ----------------- | --------- | ---------------------------------------------------- |
| `current` | `readonly Item[]` | readonly  | The filtered items. It updates as the query changes. |
