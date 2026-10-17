<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
	import styles from './index.module.css';

	const id = $props.id();

	let searchResults = $state.raw<DirectoryUser[]>([]);
	let selectedValue = $state.raw<DirectoryUser | null>(null);
	let searchValue = $state('');
	let error = $state<string | null>(null);
	let isPending = $state(false);

	const { contains } = Combobox.useFilter();

	let abortController: AbortController | null = null;

	const trimmedSearchValue = $derived(searchValue.trim());

	const items = $derived.by(() => {
		if (!selectedValue || searchResults.some((user) => user.id === selectedValue!.id)) {
			return searchResults;
		}

		return [...searchResults, selectedValue];
	});

	const status = $derived.by(() => {
		if (isPending) {
			return 'Searching…';
		}

		if (error) {
			return error;
		}

		if (trimmedSearchValue === '') {
			return selectedValue ? null : 'Start typing to search people…';
		}

		if (searchResults.length === 0) {
			return `No matches for "${trimmedSearchValue}".`;
		}

		return null;
	});

	const emptyMessage = $derived.by(() => {
		if (trimmedSearchValue === '' || isPending || searchResults.length > 0 || error) {
			return null;
		}
		return 'Try a different search term.';
	});

	async function search(query: string) {
		const controller = new AbortController();
		abortController?.abort();
		abortController = controller;

		isPending = true;
		error = null;

		const result = await searchUsers(query, contains);

		if (controller.signal.aborted) {
			return;
		}

		isPending = false;
		searchResults = result.users;
		error = result.error;
	}

	interface DirectoryUser {
		id: string;
		name: string;
		username: string;
		email: string;
		title: string;
	}

	async function searchUsers(
		query: string,
		filter: (item: string, query: string) => boolean
	): Promise<{ users: DirectoryUser[]; error: string | null }> {
		// Simulate network delay
		await new Promise((resolve) => {
			setTimeout(resolve, Math.random() * 500 + 100);
		});

		// Simulate occasional network errors (1% chance)
		if (Math.random() < 0.01 || query === 'will_error') {
			return {
				users: [],
				error: 'Failed to fetch people. Please try again.'
			};
		}

		const users = allUsers.filter((user) => {
			return (
				filter(user.name, query) ||
				filter(user.username, query) ||
				filter(user.email, query) ||
				filter(user.title, query)
			);
		});

		return {
			users,
			error: null
		};
	}

	const allUsers: DirectoryUser[] = [
		{
			id: 'leslie-alexander',
			name: 'Leslie Alexander',
			username: 'leslie',
			email: 'leslie.alexander@example.com',
			title: 'Product Manager'
		},
		{
			id: 'kathryn-murphy',
			name: 'Kathryn Murphy',
			username: 'kathryn',
			email: 'kathryn.murphy@example.com',
			title: 'Marketing Lead'
		},
		{
			id: 'courtney-henry',
			name: 'Courtney Henry',
			username: 'courtney',
			email: 'courtney.henry@example.com',
			title: 'Design Systems'
		},
		{
			id: 'michael-foster',
			name: 'Michael Foster',
			username: 'michael',
			email: 'michael.foster@example.com',
			title: 'Engineering Manager'
		},
		{
			id: 'lindsay-walton',
			name: 'Lindsay Walton',
			username: 'lindsay',
			email: 'lindsay.walton@example.com',
			title: 'Product Designer'
		},
		{
			id: 'tom-cook',
			name: 'Tom Cook',
			username: 'tom',
			email: 'tom.cook@example.com',
			title: 'Frontend Engineer'
		},
		{
			id: 'whitney-francis',
			name: 'Whitney Francis',
			username: 'whitney',
			email: 'whitney.francis@example.com',
			title: 'Customer Success'
		},
		{
			id: 'jacob-jones',
			name: 'Jacob Jones',
			username: 'jacob',
			email: 'jacob.jones@example.com',
			title: 'Security Engineer'
		},
		{
			id: 'arlene-mccoy',
			name: 'Arlene McCoy',
			username: 'arlene',
			email: 'arlene.mccoy@example.com',
			title: 'Data Analyst'
		},
		{
			id: 'marvin-mckinney',
			name: 'Marvin McKinney',
			username: 'marvin',
			email: 'marvin.mckinney@example.com',
			title: 'QA Specialist'
		},
		{
			id: 'eleanor-pena',
			name: 'Eleanor Pena',
			username: 'eleanor',
			email: 'eleanor.pena@example.com',
			title: 'Operations'
		},
		{
			id: 'jerome-bell',
			name: 'Jerome Bell',
			username: 'jerome',
			email: 'jerome.bell@example.com',
			title: 'DevOps Engineer'
		}
	];
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

{#snippet CaretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<Combobox.Root
	{items}
	itemToStringLabel={(user: DirectoryUser) => user.name}
	isItemEqualToValue={(item, value) => item.id === value.id}
	filter={null}
	onOpenChangeComplete={(open) => {
		if (!open && selectedValue) {
			searchResults = [selectedValue];
		}
	}}
	onValueChange={(nextSelectedValue) => {
		selectedValue = nextSelectedValue;
		searchValue = '';
		error = null;
	}}
	onInputValueChange={(nextSearchValue, { reason }) => {
		searchValue = nextSearchValue;

		if (nextSearchValue === '') {
			abortController?.abort();
			isPending = false;
			searchResults = [];
			error = null;
			return;
		}

		if (reason === 'item-press') {
			return;
		}

		search(nextSearchValue);
	}}
>
	<div class={styles.Label}>
		<label for={id}>Assign reviewer</label>
		<Combobox.InputGroup class={styles.InputGroup}>
			<Combobox.Input {id} placeholder="e.g. Michael" class={styles.Input} />
			<div class={styles.ActionButtons}>
				<Combobox.Clear class={styles.Clear} aria-label="Clear selection">
					{@render XIcon()}
				</Combobox.Clear>
				<Combobox.Trigger class={styles.Trigger} aria-label="Open popup">
					{@render CaretDownIcon()}
				</Combobox.Trigger>
			</div>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class={styles.Positioner} sideOffset={4}>
			<Combobox.Popup class={styles.Popup} aria-busy={isPending ? true : undefined}>
				<div class={styles.Viewport}>
					<Combobox.Status>
						{#if status}
							<div class={styles.Status}>
								{#if isPending}
									<span aria-hidden="true" class={styles.Spinner}></span>
								{/if}
								{status}
							</div>
						{/if}
					</Combobox.Status>
					<Combobox.Empty>
						{#if emptyMessage}
							<div class={styles.Empty}>
								{emptyMessage}
							</div>
						{/if}
					</Combobox.Empty>
					<Combobox.List>
						<Combobox.Collection>
							{#snippet children(user: DirectoryUser)}
								<Combobox.Item value={user} class={styles.Item}>
									<Combobox.ItemIndicator class={styles.ItemIndicator}>
										{@render CheckIcon()}
									</Combobox.ItemIndicator>
									<span class={styles.ItemText}>
										<span class={styles.ItemTitle}>{user.name}</span>
										<span class={styles.ItemEmail}>{user.email}</span>
										<span class={styles.ItemSubtitle}>
											<span>@{user.username}</span>
											<span>{user.title}</span>
										</span>
									</span>
								</Combobox.Item>
							{/snippet}
						</Combobox.Collection>
					</Combobox.List>
				</div>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
