<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
	import styles from './index.module.css';

	const id = $props.id();

	const chipProps = { 'aria-description': 'Press Backspace or Delete to remove' };

	function inputProps(selectedCount: number) {
		return {
			'aria-description':
				selectedCount > 0
					? `${selectedCount} selected. From the start of the input, press Left Arrow to focus the selected items`
					: undefined
		};
	}

	interface ProgrammingLanguage {
		id: string;
		value: string;
	}

	const langs: ProgrammingLanguage[] = [
		{ id: 'js', value: 'JavaScript' },
		{ id: 'ts', value: 'TypeScript' },
		{ id: 'py', value: 'Python' },
		{ id: 'java', value: 'Java' },
		{ id: 'cpp', value: 'C++' },
		{ id: 'cs', value: 'C#' },
		{ id: 'php', value: 'PHP' },
		{ id: 'ruby', value: 'Ruby' },
		{ id: 'go', value: 'Go' },
		{ id: 'rust', value: 'Rust' },
		{ id: 'swift', value: 'Swift' }
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

<Combobox.Root items={langs} multiple>
	<div class={styles.Container}>
		<label class={styles.Label} for={id}> Programming languages </label>
		<Combobox.InputGroup class={styles.InputGroup}>
			<Combobox.Value>
				{#snippet children(selected)}
					{@const value = selected as ProgrammingLanguage[]}
					<Combobox.Chips
						class={styles.Chips}
						aria-label={value.length > 0 ? 'Selected languages' : undefined}
					>
						{#each value as language (language.id)}
							<Combobox.Chip class={styles.Chip} aria-label={language.value} {...chipProps}>
								{language.value}
								<Combobox.ChipRemove class={styles.ChipRemove} aria-label="Remove {language.value}">
									{@render XIcon()}
								</Combobox.ChipRemove>
							</Combobox.Chip>
						{/each}
						<Combobox.Input
							{id}
							placeholder={value.length > 0 ? '' : 'e.g. TypeScript'}
							{...inputProps(value.length)}
							class={styles.Input}
						/>
					</Combobox.Chips>
				{/snippet}
			</Combobox.Value>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class={styles.Positioner} sideOffset={4}>
			<Combobox.Popup class={styles.Popup}>
				<Combobox.Empty>
					<div class={styles.Empty}>No languages found.</div>
				</Combobox.Empty>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(language: ProgrammingLanguage)}
							<Combobox.Item value={language} class={styles.Item}>
								<Combobox.ItemIndicator class={styles.ItemIndicator}>
									{@render CheckIcon()}
								</Combobox.ItemIndicator>
								<span class={styles.ItemText}>{language.value}</span>
							</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
